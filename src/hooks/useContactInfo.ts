// hooks/useContactInfo.ts
"use client";

import { useState, useEffect } from "react";

// Define the type for the PhoneNumber
interface PhoneNumber {
  id: string;
  number: string;
  label: string;
}

// Define the type for the ContactInfo
export interface ContactInfo {
  phones: PhoneNumber[];
  email: string;
  office: {
    city: string;
    postal: string;
    street: string;
    room: string;
  };
}

export const useContactInfo = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phones: [],
    email: "",
    office: {
      city: "",
      postal: "",
      street: "",
      room: "",
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/contact-info");

        if (!response.ok) {
          throw new Error("Failed to fetch contact info");
        }

        const data = await response.json();
        setContactInfo(data);
      } catch (err) {
        console.error("Error fetching contact info:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Unknown error fetching contact info"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  // Find a specific phone by label
  const getPhoneByLabel = (label: string): PhoneNumber | undefined => {
    return contactInfo.phones.find((phone) =>
      phone.label.toLowerCase().includes(label.toLowerCase())
    );
  };

  // Get main phone (assumes there's a phone with 'main', 'general', or 'üld' in the label)
  const getMainPhone = (): PhoneNumber | undefined => {
    return (
      getPhoneByLabel("main") ||
      getPhoneByLabel("general") ||
      getPhoneByLabel("üld") ||
      (contactInfo.phones.length > 0 ? contactInfo.phones[0] : undefined)
    );
  };

  return {
    contactInfo,
    isLoading,
    error,
    getPhoneByLabel,
    getMainPhone,
  };
};
