"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useContactInfo } from "@/hooks/useContactInfo";
import { Map as MapIcon } from "lucide-react";

interface FormData {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  // Honeypot fields (hidden from real users)
  website?: string; // Bots often fill this out
  notes?: string; // Secondary honeypot
  // Timestamp to detect too-fast submissions
  startTime: number;
}

interface MapComponentProps {
  address: string;
  businessHours?: string[];
  draggable?: boolean;
  onMarkerDrag?: (lat: number, lng: number) => void;
  markerText?: string; // New prop for custom marker text
  zoom?: number; // Custom zoom level
  customLat?: number; // Custom latitude
  customLng?: number; // Custom longitude
}

// Simplified Map Component using Leaflet and OpenStreetMap
const MapComponent: React.FC<MapComponentProps> = ({
  address,
  businessHours = [], // Default to empty array
  draggable = false,
  onMarkerDrag,
  markerText = "", // Default to empty string
  zoom = 17, // Default to zoom level 17
  customLat,
  customLng,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  // Create a memoized version of the business hours to avoid unnecessary re-renders
  const memoizedBusinessHours = React.useMemo(
    () => businessHours || [],
    [JSON.stringify(businessHours)]
  );

  // Create a memoized value for all dependencies to ensure consistent array size
  const mapDependencies = React.useMemo(
    () => ({
      address: address || "",
      markerText: markerText || "",
      zoom: zoom || 17,
      businessHours: memoizedBusinessHours,
      draggable: Boolean(draggable),
      hasOnMarkerDrag: Boolean(onMarkerDrag),
      customLat: customLat || null,
      customLng: customLng || null,
    }),
    [
      address,
      markerText,
      zoom,
      memoizedBusinessHours,
      draggable,
      onMarkerDrag,
      customLat,
      customLng,
    ]
  );

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Load Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const loadLeaflet = async () => {
      try {
        // Check if Leaflet is already loaded
        if (!(window as any).L) {
          const script = document.createElement("script");
          script.src =
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";
          script.async = true;

          // Create a promise to wait for script to load
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // Now initialize the map
        initMap();
      } catch (error) {
        console.error("Failed to load Leaflet:", error);
        setMapError(true);
      }
    };

    // Function to initialize the map
    const initMap = async () => {
      if (!mapRef.current || !(window as any).L) return;

      try {
        const L = (window as any).L;

        // Clean up any existing map instance
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Create the map instance with improved options for building-level view
        const map = L.map(mapRef.current, {
          zoomControl: true,
          dragging: true,
          scrollWheelZoom: false,
          // Set max zoom higher to allow seeing buildings
          maxZoom: 19,
        }).setView([0, 0], 1);

        // Store the map instance for cleanup
        mapInstanceRef.current = map;

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        // If custom coordinates are provided, use them directly
        if (
          mapDependencies.customLat !== null &&
          mapDependencies.customLng !== null
        ) {
          const lat = mapDependencies.customLat;
          const lng = mapDependencies.customLng;

          // Set view to the coordinates with the specified zoom level
          map.setView([lat, lng], mapDependencies.zoom);

          // Create marker with popup
          createMarker(
            L,
            map,
            lat,
            lng,
            mapDependencies.address,
            mapDependencies.markerText,
            mapDependencies.businessHours,
            mapDependencies.draggable,
            onMarkerDrag
          );

          // Map is loaded
          setTimeout(() => {
            map.invalidateSize();
            setMapLoaded(true);
          }, 100);
        }
        // Otherwise geocode the address
        else if (mapDependencies.address) {
          try {
            // Add more parameters to improve geocoding precision
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                mapDependencies.address
              )}&addressdetails=1&limit=1`
            );
            const data = await response.json();

            if (data && data.length > 0) {
              const lat = parseFloat(data[0].lat);
              const lon = parseFloat(data[0].lon);

              // Set view to the coordinates with the specified zoom level
              map.setView([lat, lon], mapDependencies.zoom);

              // Create marker with popup
              createMarker(
                L,
                map,
                lat,
                lon,
                mapDependencies.address,
                mapDependencies.markerText,
                mapDependencies.businessHours,
                mapDependencies.draggable,
                onMarkerDrag
              );

              // Recalculate map size after everything is loaded
              setTimeout(() => {
                map.invalidateSize();
                setMapLoaded(true);
              }, 100);
            } else {
              console.error("Address not found");
              setMapError(true);
            }
          } catch (error) {
            console.error("Error geocoding address:", error);
            setMapError(true);
          }
        } else {
          console.error("No address or coordinates provided");
          setMapError(true);
        }
      } catch (error) {
        console.error("Error initializing map:", error);
        setMapError(true);
      }
    };

    // Helper function to create a marker with popup
    const createMarker = (
      L: any,
      map: any,
      lat: number,
      lng: number,
      address: string,
      markerText?: string,
      businessHours?: string[],
      draggable?: boolean,
      onMarkerDrag?: (lat: number, lng: number) => void
    ) => {
      // Create popup content with the custom marker text
      let popupContent = "";

      // Start with the marker text if provided
      if (markerText) {
        popupContent = `<div><strong>${markerText}</strong></div>`;
        if (address) {
          popupContent += `<div>${address}</div>`;
        }
      } else {
        popupContent = `<div><strong>${address}</strong></div>`;
      }

      // Add business hours if provided
      if (businessHours && businessHours.length > 0) {
        popupContent += `
          <div>
            <p style="font-weight: bold; margin-bottom: 4px; margin-top: 8px;">Lahtiolekuaeg:</p>
            <ul style="list-style: none; padding-left: 0; margin-top: 0;">
              ${businessHours.map((hours) => `<li>${hours}</li>`).join("")}
            </ul>
          </div>
        `;
      }

      // Add a draggable marker with popup
      const marker = L.marker([lat, lng], {
        draggable: draggable || false,
      }).addTo(map);

      // Add popup to marker
      marker.bindPopup(popupContent);

      // Open popup by default to show the marker text immediately
      marker.openPopup();

      // Handle marker drag events if the marker is draggable
      if (draggable && onMarkerDrag) {
        marker.on("dragend", function (event: any) {
          const position = marker.getLatLng();
          onMarkerDrag(position.lat, position.lng);

          // Update popup position
          marker.openPopup();
        });
      }
    };

    loadLeaflet();

    // Clean up function
    return () => {
      // Properly remove the map instance when component unmounts
      if (mapInstanceRef.current && (window as any).L) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapDependencies]); // Use the memoized dependencies object

  return (
    <div className="w-full h-96 bg-gray-100 border border-gray-300 rounded overflow-hidden relative">
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <MapIcon size={32} className="text-gray-400 mr-2" />
          <span className="text-gray-500 text-sm">Kaardi laadimine...</span>
        </div>
      )}
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-gray-500 text-sm">
            Kaarti ei õnnestunud laadida
          </span>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" id="map"></div>
    </div>
  );
};

// Store submission timestamps in localStorage to implement rate limiting
const SUBMISSION_HISTORY_KEY = "contact_form_submissions";

// Get submission history from localStorage
const getSubmissionHistory = (): number[] => {
  try {
    const history = localStorage.getItem(SUBMISSION_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (e) {
    console.error("Error reading submission history:", e);
    return [];
  }
};

// Add a new submission timestamp
const addSubmission = (): void => {
  try {
    const history = getSubmissionHistory();
    history.push(Date.now());

    // Only keep the last 10 submissions to save space
    const recentHistory = history.slice(-10);
    localStorage.setItem(SUBMISSION_HISTORY_KEY, JSON.stringify(recentHistory));
  } catch (e) {
    console.error("Error saving submission history:", e);
  }
};

// Check if the user has submitted too many forms recently
const checkRateLimit = (): boolean => {
  try {
    const history = getSubmissionHistory();
    const now = Date.now();

    // Filter to get submissions in the last hour
    const recentSubmissions = history.filter(
      (time) => now - time < 60 * 60 * 1000
    );

    // Allow up to 3 submissions per hour
    return recentSubmissions.length < 3;
  } catch (e) {
    console.error("Error checking rate limit:", e);
    return true; // Allow submission if we can't check
  }
};

const initialFormState: FormData = {
  name: "",
  phone: "",
  email: "",
  subject: "",
  message: "",
  website: "", // Honeypot field
  notes: "", // Secondary honeypot
  startTime: Date.now(), // Add timestamp when form renders
};

const ContactContent: React.FC = () => {
  const { t } = useTranslation();
  const { contactInfo, isLoading } = useContactInfo();
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [isMounted, setIsMounted] = useState(false);
  const [submissionAttempts, setSubmissionAttempts] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  // Handle client-side rendering for hydration
  useEffect(() => {
    setIsMounted(true);

    // Reset the form's start time when component mounts
    setFormData((prev) => ({
      ...prev,
      startTime: Date.now(),
    }));
  }, []);

  // Reset form 3 seconds after successful submission
  useEffect(() => {
    if (submitStatus.type === "success") {
      const timer = setTimeout(() => {
        setSubmitStatus({ type: null, message: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  // Monitor for suspicious behavior
  useEffect(() => {
    if (submissionAttempts >= 5) {
      // After 5 failed attempts, introduce a delay before allowing more submissions
      const timer = setTimeout(() => {
        setSubmissionAttempts(0);
      }, 5 * 60 * 1000); // 5-minute timeout

      return () => clearTimeout(timer);
    }
  }, [submissionAttempts]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Basic required field validation
    if (!formData.name.trim()) {
      newErrors.name = t("contact.form.validation.name_required");
    } else if (formData.name.length > 100) {
      newErrors.name =
        t("contact.form.validation.name_too_long") || "Name is too long";
    }

    if (!formData.email.trim()) {
      newErrors.email = t("contact.form.validation.email_required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("contact.form.validation.email_invalid");
    } else if (formData.email.length > 100) {
      newErrors.email =
        t("contact.form.validation.email_too_long") || "Email is too long";
    }

    if (!formData.message.trim()) {
      newErrors.message = t("contact.form.validation.message_required");
    } else if (formData.message.length > 2000) {
      newErrors.message =
        t("contact.form.validation.message_too_long") || "Message is too long";
    }

    // Phone number validation (optional field)
    if (formData.phone && !/^[+\d\s()-]{6,20}$/.test(formData.phone)) {
      newErrors.phone =
        t("contact.form.validation.phone_invalid") || "Phone number is invalid";
    }

    // Subject validation (optional field)
    if (formData.subject && formData.subject.length > 200) {
      newErrors.subject =
        t("contact.form.validation.subject_too_long") || "Subject is too long";
    }

    // Check for spam indicators

    // 1. Honeypot fields - these should remain empty as they're hidden from real users
    if (formData.website || formData.notes) {
      // Don't show the real reason to potential bots
      newErrors.message =
        t("contact.form.validation.general_error") || "An error occurred";
      console.log("Honeypot field filled - likely bot submission");
    }

    // 2. Submission speed check - real users take time to fill out forms
    const timeTaken = Date.now() - formData.startTime;
    if (timeTaken < 5000) {
      // Less than 5 seconds to fill the form
      newErrors.message =
        t("contact.form.validation.general_error") || "An error occurred";
      console.log("Form filled too quickly - likely bot submission");
    }

    // 3. Rate limiting - check for too many submissions
    if (!checkRateLimit()) {
      newErrors.message =
        t("contact.form.validation.too_many_submissions") ||
        "Liiga palju katseid. Proovi hiljem uuesti.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    // Clear error for this field when user starts typing
    if (errors[id as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Increment submission attempts counter
    setSubmissionAttempts((prev) => prev + 1);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      // Prepare data to send - omit the honeypot fields
      const { website, notes, startTime, ...dataToSend } = formData;

      const response = await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...dataToSend,
          // Add timestamp for server-side validation
          submittedAt: Date.now(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Midagi läks valesti");
      }

      // Record successful submission for rate limiting
      addSubmission();

      // Reset form on success
      setFormData({
        ...initialFormState,
        startTime: Date.now(), // Reset the timer
      });

      // Reset submission attempts on success
      setSubmissionAttempts(0);

      setSubmitStatus({
        type: "success",
        message: t("contact.form.success"),
      });
    } catch (error) {
      console.error("Viga vormi saatmisel:", error);
      setSubmitStatus({
        type: "error",
        message: t("contact.form.error"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-12 py-8 sm:py-12 md:py-16 mt-4 sm:mt-6 md:mt-10">
      {/* Form and contact info in a 2-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mb-10">
        {/* Contact form */}
        <div className="border border-black p-4 sm:p-6 md:p-8">
          {submitStatus.type === "success" ? (
            <div className="mb-6">
              <p className="text-green-700">{submitStatus.message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} ref={formRef}>
              {submitStatus.type === "error" && (
                <div className="mb-6">
                  <p className="text-red-700">{submitStatus.message}</p>
                </div>
              )}

              <div className="mb-6">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-2"
                >
                  {t("contact.form.name.label")}
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={100}
                  className={`w-full border-b ${
                    errors.name ? "border-red-500" : "border-black"
                  } pb-2 focus:outline-none focus:border-gray-500`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div className="mb-6">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium mb-2"
                >
                  {t("contact.form.phone.label")}
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={20}
                  className={`w-full border-b ${
                    errors.phone ? "border-red-500" : "border-black"
                  } pb-2 focus:outline-none focus:border-gray-500`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div className="mb-6">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                >
                  {t("contact.form.email.label")}
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  maxLength={100}
                  className={`w-full border-b ${
                    errors.email ? "border-red-500" : "border-black"
                  } pb-2 focus:outline-none focus:border-gray-500`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div className="mb-6">
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium mb-2"
                >
                  {t("contact.form.subject.label")}
                </label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  maxLength={200}
                  className={`w-full border-b ${
                    errors.subject ? "border-red-500" : "border-black"
                  } pb-2 focus:outline-none focus:border-gray-500`}
                />
                {errors.subject && (
                  <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
                )}
              </div>

              <div className="mb-6">
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-2"
                >
                  {t("contact.form.message.label")}
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  maxLength={2000}
                  className={`w-full border-b ${
                    errors.message ? "border-red-500" : "border-black"
                  } pb-2 focus:outline-none focus:border-gray-500`}
                />
                {errors.message && (
                  <p className="text-red-500 text-xs mt-1">{errors.message}</p>
                )}
              </div>

              {/* Honeypot fields - hidden from real users but bots will fill them out */}
              <div className="opacity-0 absolute top-0 left-0 h-0 w-0 overflow-hidden">
                <label htmlFor="website">Website</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <p className="text-xs text-gray-500 mt-6 sm:mt-8 mb-6 sm:mb-8">
                {t("contact.form.response_time")}
              </p>

              <button
                type="submit"
                disabled={isSubmitting || submissionAttempts >= 5}
                className={`inline-flex items-center bg-black text-white px-6 py-3 rounded-full w-fit transition-colors ${
                  isSubmitting || submissionAttempts >= 5
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-gray-600"
                }`}
              >
                {isSubmitting
                  ? t("contact.form.submitting")
                  : submissionAttempts >= 5
                  ? t("contact.form.too_many_attempts") || "Palun oota..."
                  : t("contact.form.submit")}
                {/* Fix for hydration error - only render on client side */}
                {isMounted && (
                  <img
                    src="/open.svg"
                    alt="Arrow Right"
                    className="w-7 h-7 ml-2"
                  />
                )}
              </button>
            </form>
          )}
        </div>

        {/* Contact information */}
        <div className="space-y-8 sm:space-y-10 pl-0 md:pl-8 lg:pl-20">
          <div>
            <div className="border-t border-gray-300 pt-4 mb-4"></div>
            <h2 className="text-lg sm:text-xl font-medium mb-3 sm:mb-4">
              {t("footer.contact")}
            </h2>
            {isLoading ? (
              <p className="mb-1">Laen...</p>
            ) : (
              <>
                {/* Display first phone number separately with translation */}
                {contactInfo.phones && contactInfo.phones.length > 0 && (
                  <p className="mb-1">
                    {contactInfo.phones[0].number} {t("footer.general_phone")}
                  </p>
                )}

                {/* Display remaining phone numbers in a loop */}
                {contactInfo.phones &&
                  contactInfo.phones.length > 1 &&
                  contactInfo.phones.slice(1).map((phone, index) => (
                    <p className="mb-1" key={index}>
                      {phone.number}
                      {phone.label && (
                        <span className="ml-2">{phone.label}</span>
                      )}
                    </p>
                  ))}
                {contactInfo.email && (
                  <p className="mb-4">{contactInfo.email}</p>
                )}
              </>
            )}
          </div>

          <div>
            <div className="border-t border-gray-300 pt-4 mb-4"></div>
            <h2 className="text-lg sm:text-xl font-medium mb-3 sm:mb-4">
              {t("footer.office")}
            </h2>
            {isLoading ? (
              <p className="mb-1">Laen...</p>
            ) : (
              <>
                {contactInfo.office && (
                  <>
                    <p className="mb-1">{contactInfo.office.city}</p>
                    <p className="mb-1">{contactInfo.office.postal}</p>
                    <p className="mb-1">{contactInfo.office.street}</p>
                    <p className="mb-4">{contactInfo.office.room}</p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Full-width map section - HARDCODED ADDRESS AND CUSTOM MARKER */}
      <div className="mt-10 md:mt-16 mb-10">
        <div className="border-t border-gray-300 pt-4 mb-6"></div>
        {isLoading ? (
          <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
            <p>Laen...</p>
          </div>
        ) : (
          // Hardcoded address and custom marker position
          <MapComponent
            address="Peterburi tee 46-507"
            markerText="Kontor"
            zoom={18}
            // Optional: Use custom coordinates for precise marker placement
            customLat={59.42645408245162}
            customLng={24.819010248268146}
            // Optional: Add custom business hours
            businessHours={["E-R: 9-17", "Пн-Пт: 9-17", "Mon-Fri: 9-17"]}
          />
        )}
      </div>
    </div>
  );
};

export default ContactContent;
