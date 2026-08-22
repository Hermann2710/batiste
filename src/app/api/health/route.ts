import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok", service: "batiste", timestamp: new Date().toISOString() });
}
