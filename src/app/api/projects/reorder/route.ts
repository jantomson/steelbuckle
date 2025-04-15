// app/api/projects/reorder/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { orderUpdates } = await request.json();

    // Validate input
    if (!Array.isArray(orderUpdates)) {
      return NextResponse.json(
        { error: "Invalid order data. Expected array of updates." },
        { status: 400 }
      );
    }

    // Update each project's display order in a transaction
    const updates = await prisma.$transaction(
      orderUpdates.map(({ id, displayOrder }) =>
        prisma.project.update({
          where: { id },
          data: { displayOrder },
        })
      )
    );

    return NextResponse.json({
      success: true,
      updatedCount: updates.length,
    });
  } catch (error) {
    console.error("Error updating project order:", error);
    return NextResponse.json(
      { error: "Failed to update project order" },
      { status: 500 }
    );
  }
}
