import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { guid } from "@/lib/Utils";
import { ObjectId } from "mongodb";
import {deepSanitize, sanitizeRich, isValidObjectId, clampNumber,} from "@/lib/utils/sanitize";

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
