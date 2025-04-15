import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Get the first contact info record (we'll only have one)
    const contactInfo = await prisma.contactInfo.findFirst({
      include: {
        phones: true,
      },
    });

    // If no contact info exists yet, return empty template
    if (!contactInfo) {
      return NextResponse.json({
        phones: [],
        email: "",
        office: {
          city: "",
          postal: "",
          street: "",
          room: "",
        },
      });
    }

    // Transform database format to match the expected frontend format
    const formattedResponse = {
      phones: contactInfo.phones.map((phone) => ({
        id: phone.id.toString(),
        number: phone.number,
        label: phone.label,
      })),
      email: contactInfo.email,
      office: {
        city: contactInfo.officeCity,
        postal: contactInfo.officePostal,
        street: contactInfo.officeStreet,
        room: contactInfo.officeRoom || "",
      },
    };

    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error("Error fetching contact info:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact info" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();

    // Find the existing contact info (we'll only have one record)
    const existingContactInfo = await prisma.contactInfo.findFirst();

    // If we have existing contact info, update it, otherwise create a new one
    if (existingContactInfo) {
      // First update the main contact info
      await prisma.contactInfo.update({
        where: { id: existingContactInfo.id },
        data: {
          email: data.email,
          officeCity: data.office.city,
          officePostal: data.office.postal,
          officeStreet: data.office.street,
          officeRoom: data.office.room,
        },
      });

      // Delete all existing phone numbers for this contact
      await prisma.phoneNumber.deleteMany({
        where: { contactInfoId: existingContactInfo.id },
      });

      // Create the new phone numbers
      for (const phone of data.phones) {
        await prisma.phoneNumber.create({
          data: {
            contactInfoId: existingContactInfo.id,
            number: phone.number,
            label: phone.label,
          },
        });
      }
    } else {
      // Create a new contact info record
      const newContactInfo = await prisma.contactInfo.create({
        data: {
          email: data.email,
          officeCity: data.office.city,
          officePostal: data.office.postal,
          officeStreet: data.office.street,
          officeRoom: data.office.room,
          phones: {
            create: data.phones.map((phone: any) => ({
              number: phone.number,
              label: phone.label,
            })),
          },
        },
      });
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Error updating contact info:", error);
    return NextResponse.json(
      { error: "Failed to update contact info" },
      { status: 500 }
    );
  }
}
