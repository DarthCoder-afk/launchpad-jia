import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { ObjectId } from "mongodb";
import {deepSanitize, sanitizeRich, isValidObjectId, clampNumber,} from "@/lib/utils/sanitize";
import { guid } from "@/lib/Utils";

function sanitizePreScreeningQuestions(raw: any): any[] {
  if (!Array.isArray(raw)) return [];
  const maxQuestions = 25;
  const maxOptions = 25;
  return raw
    .slice(0, maxQuestions)
    .map((q) => {
      if (!q || typeof q !== "object") return null;
      const id = typeof q.id === "string" ? q.id.slice(0, 120) : `q_${guid()}`;
      const key = typeof q.key === "string" ? q.key.slice(0, 120) : id;
      const title = typeof q.title === "string" ? q.title.trim().slice(0, 200) : "";
      const type = ["dropdown", "checkboxes", "range", "short", "long"].includes(q.type) ? q.type : "short";
      const required = true;
      let options: any[] | undefined = undefined;
      if (type === "dropdown" || type === "checkboxes") {
        if (Array.isArray(q.options)) {
          options = q.options
            .slice(0, maxOptions)
            .map((o: any) => {
              if (!o || typeof o !== "object") return null;
              const oid = typeof o.id === "string" ? o.id.slice(0, 80) : "";
              const label = typeof o.label === "string" ? o.label.trim().slice(0, 120) : "";
              if (!label) return null;
              return { id: oid || label.toLowerCase().replace(/\s+/g, "-").slice(0,50), label };
            })
            .filter(Boolean);
        } else {
          options = [];
        }
      }
      let min = undefined;
      let max = undefined;
      let currency = undefined;
      if (type === "range") {
        const rawMin = typeof q.min === "string" ? q.min.replace(/[^0-9.,]/g, "") : "";
        const rawMax = typeof q.max === "string" ? q.max.replace(/[^0-9.,]/g, "") : "";
        const parsedMin = rawMin ? Number(rawMin.replace(/,/g, "")) : undefined;
        const parsedMax = rawMax ? Number(rawMax.replace(/,/g, "")) : undefined;
        if (typeof parsedMin === "number" && !isNaN(parsedMin)) min = parsedMin;
        if (typeof parsedMax === "number" && !isNaN(parsedMax)) max = parsedMax;
        if (typeof min === "number" && typeof max === "number" && min > max) {
          const temp = min;
          min = max;
          max = temp;
        }
        currency = typeof q.currency === "string" ? q.currency.trim().toUpperCase().slice(0, 6) : "PHP";
      }
      if (!title) return null;
      return { id, key, title, type, required, ...(options ? { options } : {}), ...(type === "range" ? { min, max, currency } : {}) };
    })
    .filter(Boolean);
}

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const { _id } = raw;

    // Validate required fields
    if (!isValidObjectId(_id)) {
      return NextResponse.json(
        { error: "Valid Job Object ID is required" },
        { status: 400 }
      );
    }

    const richKeys = new Set<string>(["description", "workSetupRemarks"]);
    const sanitized = deepSanitize(raw, richKeys) as typeof raw;

    // Optionally refine certain fields post-sanitize
    if (typeof sanitized.description === "string") {
      sanitized.description = sanitizeRich(sanitized.description, 20000);
    }
    if (sanitized.minimumSalary) {
      sanitized.minimumSalary = clampNumber(sanitized.minimumSalary, { min: 0 });
    }
    if (sanitized.maximumSalary) {
      sanitized.maximumSalary = clampNumber(sanitized.maximumSalary, { min: 0 });
    }

    // Remove _id so we don't overwrite it accidentally
    delete sanitized._id;

    // Sanitize preScreeningQuestions if present
    if ("preScreeningQuestions" in sanitized) {
      sanitized.preScreeningQuestions = sanitizePreScreeningQuestions(
        (sanitized as any).preScreeningQuestions
      );
    }

    const { db } = await connectMongoDB();

    

    await db
      .collection("careers")
      .updateOne({ _id: new ObjectId(_id) }, { $set: sanitized });

    return NextResponse.json({
      message: "Career updated successfully",
      career: sanitized,
    });
  } catch (error) {
    console.error("Error adding career:", error);
    return NextResponse.json(
      { error: "Failed to add career" },
      { status: 500 }
    );
  }
}
