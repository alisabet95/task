//file: app/api/register
import { NextResponse } from "next/server";
import { prisma } from "@/prisma/clientali";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "یوزرنیم باید حداقل سه حرف باشد")
    .max(20, "یوزرنیم باید کمتر از 20 حرف باشد")
    .regex(/^[a-zA-Z0-9_]+$/, "فقط حرف انگلیسی، عدد و آندرلاین"),
  email: z.string().email("باید ایمیل صحیح باشد"),
  password: z.string().min(6, "پسوورد حداقل 6 حرف باشد"),
  honey: z.string().optional(),
});

export async function POST(request) {
  try {
    const body = await request.json();
    const parsedData = registerSchema.safeParse(body);

    if (body.honey) {
      return NextResponse.json(
        { error: "ربات تشخیص داده شد" },
        { status: 400 }
      );
    }

    if (!parsedData.success) {
      const errorMessage = parsedData.error.errors[0].message;
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { username, email, password } = parsedData.data;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });
    if (existingUser) {
      return NextResponse.json(
        {
          error:
            existingUser.username === username
              ? "یوزرنیم قبلاً استفاده شده است"
              : "ایمیل قبلاً ثبت شده است",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(16).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        provider: "credentials",
      },
    });
    console.log(user);

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    try {
      await sendVerificationEmail(email, token, username);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return NextResponse.json(
        { error: "ثبت نام موفقیت‌آمیز بود، ولی ایمیل تأیید ارسال نشد" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message:
          "ثبت نام موفقیت‌آمیز بود، لطفاً ایمیل خود را برای تأیید چک کنید",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "خطای سرور رخ داده است" },
      { status: 500 }
    );
  }
}
