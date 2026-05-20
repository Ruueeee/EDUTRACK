import prisma from "./prisma";

export async function generateUniqueClassCode(): Promise<string> {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let code: string;
  let exists = true;

  while (exists) {
    code = Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");
    const found = await prisma.course.findUnique({ where: { classCode: code } });
    exists = !!found;
  }

  return code!;
}
