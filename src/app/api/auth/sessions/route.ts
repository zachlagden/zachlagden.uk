import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";

// GET - List all sessions for current user
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const sessions = await db
      .collection("sessions")
      .find({ userId: session.user.id })
      .project({
        _id: 1,
        expires: 1,
        // Note: Auth.js doesn't store device info by default
        // We could add user agent tracking later if needed
      })
      .toArray();

    return NextResponse.json({
      sessions: sessions.map((s) => ({
        id: s._id.toString(),
        expires: s.expires,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 },
    );
  }
}

// DELETE - Sign out of sessions
export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { all, sessionId } = await request.json();
    const client = await clientPromise;
    const db = client.db();

    if (all) {
      // Sign out everywhere - delete all sessions for this user
      const result = await db
        .collection("sessions")
        .deleteMany({ userId: session.user.id });

      return NextResponse.json({
        success: true,
        deletedCount: result.deletedCount,
      });
    } else if (sessionId) {
      // Sign out specific session
      const result = await db.collection("sessions").deleteOne({
        _id: sessionId,
        userId: session.user.id, // Ensure user owns this session
      });

      return NextResponse.json({
        success: true,
        deleted: result.deletedCount > 0,
      });
    }

    return NextResponse.json(
      { error: "Must specify 'all: true' or 'sessionId'" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Failed to delete sessions:", error);
    return NextResponse.json(
      { error: "Failed to delete sessions" },
      { status: 500 },
    );
  }
}
