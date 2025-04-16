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

    // Send email to admin with styled template
    await transporter.sendMail({
      from: `"Kontaktivorm" <${
        process.env.EMAIL_USER || "noreply@example.com"
      }>`,
      to: adminEmail,
      subject: `Uus päringu vorm: ${subject || "Teema puudub"}`,
      html: `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8"> 
          <meta http-equiv="X-UA-Compatible" content="IE=edge"> 
          <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
          <title>Steelbuckle OÜ - Kontaktivorm</title>
          <style type="text/css">
            body {
              margin: 0 !important;
              padding: 0;
              background-color: #ffffff;
              font-family: Arial, sans-serif;
            }
            .bodycopy {
              font-size: 16px;
              line-height: 24px !important;
              font-family: Arial, sans-serif;
              color: #01363C;
              margin-top: 0px;
            }
            .bodycopy3 {
              font-size: 32px;
              line-height: 38px !important;
              font-family: Arial, sans-serif;
              font-weight: bold;
              margin-top: 0px;
            }
            .footer {
              font-size: 12px;
              line-height: 18px !important;
              font-family: Arial, sans-serif;
              margin-top: 0px;
            }
            @media only screen and (max-width: 500px) {
              .column {
                max-width: 100% !important;
              }
              .mobile-padding {
                padding: 15px !important;
              }
            }
          </style>
        </head>
        <body>
          <center style="width:100%;table-layout:fixed;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
            <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff">
              <tr>
                <td>
                  <div style="max-width:600px;margin:0 auto;padding:0 20px;">
                    <table align="center" bgcolor="#ffffff" style="border-spacing:0;font-family:sans-serif;color:#00363d;margin:0 auto;width:100%;max-width:600px;">
                      
                      <!-- TITLE -->
                      <tr>
                        <td style="padding: 20px 25px 10px 25px; background-color: #ffffff;">
                          <p style="margin-top:0px; font-size:36px; color:#00363d; line-height:46px; margin-bottom:0px; font-weight:700; font-family: Arial, sans-serif; text-align: center;">
                            Uus päringu vorm
                          </p>
                        </td>
                      </tr>
                      
                      <!-- CONTENT -->
                      <tr>
                        <td style="padding: 15px 25px 25px 25px; background-color: #ffffff;">
                          <table width="100%" style="border-spacing:0; background-color: #f5f7f8; border-radius: 5px;">
                            <tr>
                              <td style="padding: 30px; background-color: #f5f7f8;">
                                <table width="100%" style="border-spacing:0;">
                                  <tr>
                                    <td style="padding-bottom: 15px;">
                                      <p style="margin:0; font-size:18px; font-weight:bold; color:#01363C;">Kliendi info:</p>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding-bottom: 10px;">
                                      <p style="margin:0; font-size:16px; line-height:24px; color:#01363C;">
                                        <strong>Nimi:</strong> ${name}
                                      </p>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding-bottom: 10px;">
                                      <p style="margin:0; font-size:16px; line-height:24px; color:#01363C;">
                                        <strong>E-post:</strong> ${email}
                                      </p>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding-bottom: 10px;">
                                      <p style="margin:0; font-size:16px; line-height:24px; color:#01363C;">
                                        <strong>Telefon:</strong> ${
                                          phone || "Ei ole sisestatud"
                                        }
                                      </p>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding-bottom: 15px;">
                                      <p style="margin:0; font-size:16px; line-height:24px; color:#01363C;">
                                        <strong>Teema:</strong> ${
                                          subject || "Ei ole sisestatud"
                                        }
                                      </p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          
                          <table width="100%" style="border-spacing:0; margin-top: 20px; background-color: #f5f7f8; border-radius: 5px;">
                            <tr>
                              <td style="padding: 30px; background-color: #f5f7f8;">
                                <table width="100%" style="border-spacing:0;">
                                  <tr>
                                    <td style="padding-bottom: 15px;">
                                      <p style="margin:0; font-size:18px; font-weight:bold; color:#01363C;">Sõnum:</p>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding-bottom: 10px;">
                                      <p style="margin:0; font-size:16px; line-height:24px; color:#01363C;">
                                        ${message.replace(/\n/g, "<br>")}
                                      </p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- FOOTER -->
                      <tr>
                        <td style="padding: 20px 25px; background-color: #ffffff; border-top: 1px solid #E1E1E1;">
                          <table width="100%" style="border-spacing:0;">
                            <tr>
                              <td style="text-align: center; padding-bottom: 10px;">
                                <p style="margin:0; font-size:12px; line-height:18px; color:#999999;">
                                  Steelbuckle OÜ
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="text-align: center;">
                                <p style="margin:0; font-size:12px; line-height:18px; color:#999999;">
                                  See e-kiri saadeti automaatselt kontaktivormist.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>
            </table>
          </center>
        </body>
        </html>
      `,
    });

    // Send autoreply to the user with styled template
    await transporter.sendMail({
      from: `"Steelbuckle OÜ" <${
        process.env.EMAIL_USER || "noreply@example.com"
      }>`,
      to: email,
      subject: "Täname, et võtsite meiega ühendust",
      html: `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8"> 
          <meta http-equiv="X-UA-Compatible" content="IE=edge"> 
          <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
          <title>Steelbuckle OÜ - Kinnitus</title>
          <style type="text/css">
            body {
              margin: 0 !important;
              padding: 0;
              background-color: #ffffff;
              font-family: Arial, sans-serif;
            }
            .bodycopy {
              font-size: 16px;
              line-height: 24px !important;
              font-family: Arial, sans-serif;
              color: #01363C;
              margin-top: 0px;
            }
            .bodycopy3 {
              font-size: 32px;
              line-height: 38px !important;
              font-family: Arial, sans-serif;
              font-weight: bold;
              margin-top: 0px;
            }
            .footer {
              font-size: 12px;
              line-height: 18px !important;
              font-family: Arial, sans-serif;
              margin-top: 0px;
            }
            @media only screen and (max-width: 500px) {
              .column {
                max-width: 100% !important;
              }
              .mobile-padding {
                padding: 15px !important;
              }
            }
          </style>
        </head>
        <body>
          <center style="width:100%;table-layout:fixed;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
            <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#ffffff">
              <tr>
                <td>
                  <div style="max-width:600px;margin:0 auto;padding:0 20px;">
                    <table align="center" bgcolor="#ffffff" style="border-spacing:0;font-family:sans-serif;color:#00363d;margin:0 auto;width:100%;max-width:600px;">
                      
                      <!-- TITLE -->
                      <tr>
                        <td style="padding: 20px 25px 10px 25px; background-color: #ffffff;">
                          <p style="margin-top:0px; font-size:36px; color:#00363d; line-height:46px; margin-bottom:0px; font-weight:700; font-family: Arial, sans-serif; text-align: center;">
                            Täname, et võtsite meiega ühendust
                          </p>
                        </td>
                      </tr>
                      
                      <!-- CONTENT -->
                      <tr>
                        <td style="padding: 20px 25px 0px 25px; background-color: #ffffff;">
                          <table width="100%" style="border-spacing:0;">
                            <tr>
                              <td style="padding-bottom: 30px;">
                                <p style="margin:0; font-size:16px; line-height:24px; color:#01363C;">
                                  Tere ${name},
                                </p>
                                <p style="margin-top:15px; font-size:16px; line-height:24px; color:#01363C;">
                                  Oleme Teie sõnumi kätte saanud ja vastame esimesel võimalusel.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding: 0px 25px 25px 25px; background-color: #ffffff;">
                          <table width="100%" style="border-spacing:0; background-color: #f5f7f8; border-radius: 5px;">
                            <tr>
                              <td style="padding: 30px; background-color: #f5f7f8;">
                                <table width="100%" style="border-spacing:0;">
                                  <tr>
                                    <td style="padding-bottom: 15px;">
                                      <p style="margin:0; font-size:18px; font-weight:bold; color:#01363C;">Teie sõnum:</p>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding-bottom: 10px;">
                                      <p style="margin:0; font-size:16px; line-height:24px; color:#01363C;">
                                        <strong>Teema:</strong> ${
                                          subject || "Teema puudub"
                                        }
                                      </p>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding-bottom: 10px;">
                                      <p style="margin:0; font-size:16px; line-height:24px; color:#01363C;">
                                        ${message.replace(/\n/g, "<br>")}
                                      </p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- SIGNATURE -->
                      <tr>
                        <td style="padding: 20px 25px; background-color: #ffffff;">
                          <table width="100%" style="border-spacing:0;">
                            <tr>
                              <td>
                                <p style="margin:0; font-size:16px; line-height:24px; color:#01363C;">
                                  Parimate soovidega,
                                </p>
                                <p style="margin-top:5px; font-size:16px; line-height:24px; color:#01363C; font-weight: bold;">
                                  Steelbuckle meeskond
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- FOOTER -->
                      <tr>
                        <td style="padding: 20px 25px; background-color: #ffffff; border-top: 1px solid #E1E1E1;">
                          <table width="100%" style="border-spacing:0;">
                            <tr>
                              <td style="text-align: center; padding-bottom: 10px;">
                                <p style="margin:0; font-size:12px; line-height:18px; color:#999999;">
                                  Peterburi tee 46-507, Tallinn, Eesti
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="text-align: center;">
                                <p style="margin:0; font-size:12px; line-height:18px; color:#999999;">
                                  +372 5879 5887
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>
            </table>
          </center>
        </body>
        </html>
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
