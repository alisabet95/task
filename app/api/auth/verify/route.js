import { NextResponse } from "next/server";
import { prisma } from "@/prisma/clientali";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "توکن ارائه نشده است" }, { status: 400 });
  }

  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (
      !verificationToken ||
      new Date(verificationToken.expires) < new Date()
    ) {
      return NextResponse.json(
        { error: "توکن نامعتبر یا منقضی شده است" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.delete({
      where: { token },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}/login?verified=true`);
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "خطایی در فرآیند تأیید رخ داد" },
      { status: 500 }
    );
  }
}