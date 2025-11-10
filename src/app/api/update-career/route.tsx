import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { ObjectId } from "mongodb";
import {deepSanitize, sanitizeRich, isValidObjectId, clampNumber,} from "@/lib/utils/sanitize";

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
