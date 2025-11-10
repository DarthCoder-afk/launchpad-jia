// TODO (Vince) - For Merging

import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { NextResponse } from "next/server";

// Accept query params:
//   - orgID: filter by organization id (string)
//   - all=true: return all active careers across orgs (use cautiously)
export async function GET(request: Request) {
  const { db } = await connectMongoDB();
  const url = new URL(request.url);
  const orgID = url.searchParams.get("orgID");
  const all = url.searchParams.get("all") === "true";
  const hostname = url.hostname.toLowerCase();

  let filter: any = { status: "active" };
  if (orgID) {
    filter.orgID = orgID;
  } else if (!all) {
    // Default behavior: if running under Whitecloak domain, restrict to its org; otherwise, show all active
    const whitecloakDefault = "682d3fc222462d03263b0881";
    if (hostname.includes("whitecloak")) {
      filter.orgID = whitecloakDefault;
    }
  }

  const careers = await db
    .collection("careers")
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json(careers);
}
