import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { guid } from "@/lib/Utils";
import { ObjectId } from "mongodb";
import {deepSanitize, sanitizeRich, isValidObjectId, clampNumber,} from "@/lib/utils/sanitize";

// Lightweight sanitizer specifically for pre-screening questions.
// Kept inline (instead of in sanitize.ts) to avoid broad refactors; can be extracted later.
function sanitizePreScreeningQuestions(raw: any): any[] {
  if (!Array.isArray(raw)) return [];
  const maxQuestions = 25;
  const maxOptions = 25;
  return raw
    .slice(0, maxQuestions)
    .map((q) => {
      if (!q || typeof q !== "object") return null;
      const id = typeof q.id === "string" ? q.id.slice(0, 120) : "";
      const key = typeof q.key === "string" ? q.key.slice(0, 120) : id;
      const title = typeof q.title === "string" ? q.title.trim().slice(0, 200) : "";
      const type = ["dropdown", "checkboxes", "range", "short", "long"].includes(q.type) ? q.type : "short";
      const required = true; // All required for now (future toggle possible)
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
          // swap if user inverted
          const temp = min;
          min = max;
          max = temp;
        }
        currency = typeof q.currency === "string" ? q.currency.trim().toUpperCase().slice(0, 6) : "PHP";
      }
      if (!title) return null; // drop empty
      return { id, key, title, type, required, ...(options ? { options } : {}), ...(type === "range" ? { min, max, currency } : {}) };
    })
    .filter(Boolean);
}

export async function POST(request: Request) {
  try {
    // Parse raw body
    const raw = await request.json();

    // Required fields check
    const required = [
      "jobTitle",
      "description",
      "questions",
      "location",
      "workSetup",
      "orgID",
    ] as const;

    for (const key of required){
      if(!(key in raw)){
        return NextResponse.json(
          { error: `Missing required field: ${key}` },
          { status: 400 }
        )
      }
    }

    // Validate ObjectId early
    if(!isValidObjectId(raw.orgID)){
      return NextResponse.json(
        { error: "Invalid orgID" }, 
        { status: 400 }
      );
    }

    // Sanitize entire payload (allow limited rich HTML on these keys)
    const richKeys = new Set<string>(["description", "workSetupRemarks"]);
    const sanitized = deepSanitize(raw, richKeys) as typeof raw;

    // 5. Field-specific post-processing / constraints
    const jobTitle =
      typeof sanitized.jobTitle === "string"
        ? sanitized.jobTitle.slice(0, 150)
        : "";
    const description =
      typeof sanitized.description === "string"
        ? sanitizeRich(sanitized.description, 20000)
        : "";

    if (!jobTitle || !description) {
      return NextResponse.json(
        { error: "Job title and description are required" },
        { status: 400 }
      );
    }

    const salaryNegotiable = Boolean(sanitized.salaryNegotiable);
    const minimumSalary = clampNumber(sanitized.minimumSalary, { min: 0 });
    const maximumSalary = clampNumber(sanitized.maximumSalary, { min: 0 });

    if (
      !salaryNegotiable &&
      typeof minimumSalary === "number" &&
      typeof maximumSalary === "number" &&
      minimumSalary > maximumSalary
    ) {
      return NextResponse.json(
        { error: "minimumSalary cannot be greater than maximumSalary" },
        { status: 400 }
      );
    }

    const status = sanitized.status === "inactive" ? "inactive" : "active";

    // DB Connection
    const { db } = await connectMongoDB();

    const orgDetails = await db.collection("organizations").aggregate([
      {
        $match: {
           _id: new ObjectId(sanitized.orgID)
        }
      },
      {
        $lookup: {
            from: "organization-plans",
            let: { planId: "$planId" },
            pipeline: [
                {
                    $addFields: {
                        _id: { $toString: "$_id" }
                    }
                },
                {
                    $match: {
                        $expr: { $eq: ["$_id", "$$planId"] }
                    }
                }
            ],
            as: "plan"
        }
      },
      {
        $unwind: "$plan"
      },
    ]).toArray();

    if (!orgDetails || orgDetails.length === 0) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const totalActiveCareers = await db.collection("careers").countDocuments({ orgID: sanitized.orgID, status: "active" });

    if (totalActiveCareers >= (orgDetails[0].plan.jobLimit + (orgDetails[0].extraJobSlots || 0))) {
      return NextResponse.json({ error: "You have reached the maximum number of jobs for your plan" }, { status: 400 });
    }

    // Construct document using sanitized values only
    const career = {
      id: guid(),
      jobTitle,
      description,
      questions: sanitized.questions,
      preScreeningQuestions: sanitizePreScreeningQuestions(sanitized.preScreeningQuestions),
      location: sanitized.location,
      workSetup: sanitized.workSetup,
      workSetupRemarks:
        typeof sanitized.workSetupRemarks === "string"
          ? sanitized.workSetupRemarks.slice(0, 2000)
          : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastEditedBy: sanitized.lastEditedBy,
      createdBy: sanitized.createdBy,
      status,
      screeningSetting: sanitized.screeningSetting,
      orgID: sanitized.orgID,
      requireVideo: Boolean(sanitized.requireVideo),
      lastActivityAt: new Date(),
      salaryNegotiable,
      minimumSalary,
      maximumSalary,
      country: sanitized.country,
      province: sanitized.province,
      employmentType: sanitized.employmentType,
    };
    // Insert into DB
    await db.collection("careers").insertOne(career);

    return NextResponse.json({
      message: "Career added successfully",
      career,
    });
  } catch (error) {
    console.error("Error adding career:", error);
    return NextResponse.json(
      { error: "Failed to add career" },
      { status: 500 }
    );
  }
}
