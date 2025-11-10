import sanitizeHtml from "sanitize-html";

/**
 * Security/Sanitization helpers
 *
 * Purpose:
 * - Prevent XSS by sanitizing any untrusted string before storing or rendering.
 * - Provide consistent, centralized rules for "plain text" vs "rich text" fields.
 * - Offer a deep sanitizer that traverses nested objects/arrays so you don't have
 *   to remember every field name or shape when new fields are added.
 *
 * General guidance:
 * - Use sanitizeStrict for fields that should never contain HTML (e.g., jobTitle, location).
 * - Use sanitizeRich for fields that allow limited formatting (e.g., description).
 * - Prefer sanitizing on the server (API routes) before persisting.
 * - When rendering HTML in the client (e.g., dangerouslySetInnerHTML), also sanitize there
 *   (e.g., DOMPurify) for defense-in-depth.
 *
 * Notes:
 * - We cap the length of sanitized outputs (max parameter) to reduce abuse/DoS risk.
 * - The "rich" allowlist below is conservative; expand only as needed after review.
 * - Sanitization does not replace output encoding. Avoid injecting user input into
 *   attribute contexts, inline scripts/styles, URLs, etc.
 */

// Remove all HTML tags/attributes (for plain text fields)
/**
 * Sanitize a string by stripping all HTML tags/attributes.
 *
 * Use for: Titles, names, labels, simple inputs that must be plain text.
 *
 * @param input The untrusted string value.
 * @param max Optional max characters to keep (default: 10,000).
 * @returns A plain text string safe to store and render.
 *
 * @example
 * sanitizeStrict('<img src=x onerror=alert(1)> Hello') // ' Hello'
 */
export function sanitizeStrict(input: string, max = 10000): string {
  const sanitized = sanitizeHtml(input ?? "", {
    allowedTags: [],
    allowedAttributes: {},
  });
  // Hard cap the string length (helps mitigate large payloads / abuse).
  return sanitized.slice(0, max);
}

// Allow a small safe subset (for rich text like description)
/**
 * Sanitize a string while allowing a minimal, safe subset of HTML.
 *
 * Use for: Rich text fields that require basic formatting (paragraphs, lists, emphasis).
 * Avoid adding media/iframes/styles without a security review.
 *
 * @param input The untrusted string value.
 * @param max Optional max characters to keep (default: 20,000).
 * @returns A sanitized HTML string with only allowed tags/attributes.
 *
 * @example
 * sanitizeRich('<p><strong>Hello</strong> <script>alert(1)</script></p>')
 * // '<p><strong>Hello</strong> </p>'
 */
export function sanitizeRich(input: string, max = 20000): string {
  const sanitized = sanitizeHtml(input ?? "", {
    // Keep this list conservative; expand only if there's a documented need.
    allowedTags: ["p", "br", "ul", "ol", "li", "strong", "em", "b", "i", "u", "a"],
    allowedAttributes: { a: ["href", "title", "target", "rel"] },
    allowedSchemesByTag: { a: ["http", "https", "mailto", "tel"] },
    // Ensure safe link behavior and avoid rel/target injection pitfalls.
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "nofollow noopener noreferrer",
        target: "_blank",
      }),
    },
  });
  return sanitized.slice(0, max);
}

// Deep traversal sanitization for nested objects/arrays
/**
 * Deeply sanitize any object/array structure:
 * - All string values are sanitized.
 * - Keys listed in `richKeys` use sanitizeRich; others use sanitizeStrict.
 *
 * Useful when request payloads can evolve—new string fields are automatically sanitized.
 *
 * @param value Any JSON-like value (object, array, primitive).
 * @param richKeys Field names that should allow limited rich HTML (e.g., 'description').
 * @returns A sanitized deep clone of the input.
 *
 * @example
 * const safe = deepSanitize(reqBody, new Set(['description', 'notes']));
 */
export function deepSanitize<T>(
  value: T,
  richKeys: Set<string> = new Set()
): T {
  if (typeof value === "string") {
    // Primitive string at the leaf
    return sanitizeStrict(value) as unknown as T;
  }
  if (Array.isArray(value)) {
    // Sanitize each item recursively
    return value.map((v) => deepSanitize(v, richKeys)) as unknown as T;
  }
  if (value && typeof value === "object") {
    // Build a sanitized clone without mutating the original
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (typeof v === "string") {
        // Use rich sanitizer if the key is whitelisted for rich content
        out[k] = richKeys.has(k) ? sanitizeRich(v) : sanitizeStrict(v);
      } else {
        // Recurse for nested arrays/objects; leave other primitives as-is
        out[k] = deepSanitize(v, richKeys);
      }
    }
    return out as T;
  }
  // Numbers/booleans/null/undefined are returned as-is
  return value;
}

/**
 * Lightweight ObjectId format check (24 hex chars).
 * This avoids try/catch on ObjectId construction for quick validation.
 *
 * @param id A candidate ObjectId string.
 * @returns true if it looks like a valid ObjectId.
 */
export function isValidObjectId(id?: string): boolean {
  return !!id && /^[a-fA-F0-9]{24}$/.test(id);
}

/**
 * Convert a value to number and clamp to an optional [min, max] range.
 * Returns undefined if the value can't be converted to a number.
 *
 * @param n Input value (unknown).
 * @param options Optional min/max bounds.
 * @returns The clamped number or undefined if NaN.
 *
 * @example
 * clampNumber("10.5", { min: 0 }) // 10.5
 * clampNumber("abc")              // undefined
 */
export function clampNumber(
  n: unknown,
  { min, max }: { min?: number; max?: number } = {}
) {
  let num = typeof n === "number" ? n : Number(n);
  if (Number.isNaN(num)) return undefined;
  if (typeof min === "number" && num < min) num = min;
  if (typeof max === "number" && num > max) num = max;
  return num;
}