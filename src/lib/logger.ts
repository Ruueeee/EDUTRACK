import { Prisma } from "@prisma/client";
import prisma from "./prisma";

/**
 * Logs an activity to the database.
 * @param userId - The ID of the user performing the action.
 * @param action - The action being performed (e.g., 'CREATE_COURSE').
 * @param metadata - Optional metadata about the action.
 */
export async function logActivity(
  userId: string,
  action: string,
  metadata?: Record<string, unknown>
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        metadata: (metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

