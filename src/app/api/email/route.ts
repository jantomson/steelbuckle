import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Configure your email transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true", // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Admin email to receive form submissions
const adminEmail = process.env.ADMIN_EMAIL;

export async function POST(request: NextRequest) {
  try {
    // Get form data from request body
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        {
          success: false,
          message: "Nimi, e-post ja sõnum on kohustuslikud väljad",
        },
        { status: 400 }
      );
    }

    // Send email to admin
    await transporter.sendMail({
      from: `"Kontaktivorm" <${
        process.env.EMAIL_USER || "noreply@example.com"
      }>`,
      to: adminEmail,
      subject: `Uus päringu vorm: ${subject || "Teema puudub"}`,
      html: `
        <h1>Uus päringu vorm</h1>
        <p><strong>Nimi:</strong> ${name}</p>
        <p><strong>E-post:</strong> ${email}</p>
        <p><strong>Telefon:</strong> ${phone || "Ei ole sisestatud"}</p>
        <p><strong>Teema:</strong> ${subject || "Ei ole sisestatud"}</p>
        <h2>Sõnum:</h2>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    // Send autoreply to the user
    await transporter.sendMail({
      from: `"Steelbuckle OÜ" <${
        process.env.EMAIL_USER || "noreply@example.com"
      }>`,
      to: email,
      subject: "Täname, et võtsite meiega ühendust",
      html: `
        <h1>Täname, et võtsite meiega ühendust</h1>
        <p>Tere ${name},</p>
        <p>Oleme Teie sõnumi kätte saanud ja vastame esimesel võimalusel.</p>
        <p>Teie sõnum:</p>
        <hr>
        <p><strong>Teema:</strong> ${subject || "Teema puudub"}</p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <hr>
        <p>Parimate soovidega,</p>
        <p>Steelbuckle meeskond</p>
      `,
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Teie sõnum on edukalt saadetud!",
    });
  } catch (error) {
    console.error("Viga e-kirja saatmisel:", error);
    return NextResponse.json(
      {
        success: false,
        message: "E-kirja saatmine ebaõnnestus. Palun proovige hiljem uuesti.",
      },
      { status: 500 }
    );
  }
}
