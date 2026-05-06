import { auth } from "./auth";
import { NextResponse } from "next/server";

export async function getSession() {
  return await auth();
}

export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.isAdmin === true;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  return null;
}
