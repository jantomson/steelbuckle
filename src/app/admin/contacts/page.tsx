"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/admin/AdminSidebar";

interface PhoneNumber {
  id: string;
  number: string;
  label: string;
}

interface ContactInfo {
  phones: PhoneNumber[];
  email: string;
  office: {
    city: string;
    postal: string;
    street: string;
    room: string;
  };
}

export default function AdminContacts() {
  // Initialize with an array of phones
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phones: [{ id: "general", number: "", label: "Üldtelefon" }],
    email: "",
    office: {
      city: "",
      postal: "",
      street: "",
      room: "",
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const response = await fetch("/api/contact-info");
      if (response.ok) {
        const data = await response.json();
        // Make sure phones is an array
        if (data && data.phones) {
          // If phones isn't an array (e.g., it's an object with keys like 'main', 'phone_1', etc.)
          // then convert it to an array
          if (!Array.isArray(data.phones)) {
            const phonesArray = Object.entries(data.phones).map(
              ([id, details]: [string, any]) => ({
                id,
                number: details.number,
                label: details.label,
              })
            );
            data.phones = phonesArray;
          }

          // Ensure "general" phone exists
          const generalPhone = data.phones.find(
            (phone: PhoneNumber) =>
              phone.label.toLowerCase() === "üldtelefon" ||
              phone.id === "general"
          );

          if (!generalPhone) {
            data.phones.unshift({
              id: "general",
              number: "",
              label: "Üldtelefon",
            });
          }
        } else {
          // Default to an array with one item if phones is missing or invalid
          data.phones = [{ id: "general", number: "", label: "Üldtelefon" }];
        }
        setContactInfo(data);
      }
    } catch (error) {
      setMessage("Viga kontaktandmete laadimisel");
      // Ensure we have a valid phones array even if the fetch fails
      setContactInfo((prevState) => ({
        ...prevState,
        phones: [{ id: "general", number: "", label: "Üldtelefon" }],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/contact-info", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactInfo),
      });

      if (response.ok) {
        setMessage("Kontaktandmed edukalt uuendatud");
      } else {
        setMessage("Kontaktandmete uuendamine ebaõnnestus");
      }
    } catch (error) {
      setMessage("Viga kontaktandmete uuendamisel");
    }
  };

  const addPhone = () => {
    const newId = `phone_${Date.now()}`;
    setContactInfo({
      ...contactInfo,
      phones: [...contactInfo.phones, { id: newId, number: "", label: "" }],
    });
  };

  const deletePhone = (idToDelete: string) => {
    // Prevent deletion of general phone
    if (
      idToDelete === "general" ||
      contactInfo.phones.find((p) => p.id === idToDelete)?.label ===
        "Üldtelefon"
    ) {
      setMessage("Üldtelefoni ei saa kustutada");
      return;
    }

    // Prevent deletion if only one phone would remain
    if (contactInfo.phones.length <= 1) {
      setMessage("Vähemalt üks telefoninumber on vajalik");
      return;
    }

    setContactInfo({
      ...contactInfo,
      phones: contactInfo.phones.filter((phone) => phone.id !== idToDelete),
    });
  };

  const updatePhone = (
    id: string,
    field: "number" | "label",
    value: string
  ) => {
    // Prevent changing label for general phone
    if (
      field === "label" &&
      (id === "general" ||
        contactInfo.phones.find((p) => p.id === id)?.label === "Üldtelefon")
    ) {
      return;
    }

    setContactInfo({
      ...contactInfo,
      phones: contactInfo.phones.map((phone) =>
        phone.id === id ? { ...phone, [field]: value } : phone
      ),
    });
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16 lg:pt-0">
        Laadimine...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <Sidebar activePage="contacts" />

        {/* Main content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
              Kontaktandmed
            </h2>

            {message && (
              <div className="mb-4 p-3 sm:p-4 rounded-md bg-green-100 text-green-700">
                {message}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="bg-white shadow-md rounded-md p-4 sm:p-6 space-y-4 sm:space-y-6"
            >
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2 sm:gap-0">
                  <h3 className="text-base sm:text-lg font-medium text-center">
                    Telefoninumbrid
                  </h3>
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={addPhone}
                      className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 w-auto"
                    >
                      + Lisa telefon
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {contactInfo.phones.map((phone) => {
                    const isGeneralPhone =
                      phone.id === "general" || phone.label === "Üldtelefon";

                    return (
                      <div
                        key={phone.id}
                        className="grid grid-cols-12 gap-2 sm:gap-4 items-center"
                      >
                        <div
                          className={
                            isGeneralPhone
                              ? "col-span-10 sm:col-span-10"
                              : "col-span-6 sm:col-span-5"
                          }
                        >
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            Number
                          </label>
                          <input
                            type="text"
                            value={phone.number}
                            onChange={(e) =>
                              updatePhone(phone.id, "number", e.target.value)
                            }
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="+372 123 4567"
                          />
                        </div>

                        {!isGeneralPhone && (
                          <>
                            <div className="col-span-5 sm:col-span-5">
                              <label className="block text-gray-700 text-sm font-bold mb-2">
                                Nimetus
                              </label>
                              <input
                                type="text"
                                value={phone.label}
                                onChange={(e) =>
                                  updatePhone(phone.id, "label", e.target.value)
                                }
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="Kontakti nimetus"
                              />
                            </div>
                            <div className="col-span-1 sm:col-span-2 flex items-center justify-center ml-2">
                              <button
                                type="button"
                                onClick={() => deletePhone(phone.id)}
                                className="text-red-500 hover:text-red-700"
                                title="Kustuta telefoninumber"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                          </>
                        )}

                        {isGeneralPhone && (
                          <div className="col-span-2 sm:col-span-2 flex items-center justify-center mt-7 sm:mt-8 ml-2 sm:ml-4">
                            <span className="text-gray-500 text-sm font-medium">
                              Üldtelefon
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">
                  E-post
                </h3>
                <input
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, email: e.target.value })
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="näide@näide.ee"
                />
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">
                  Kontori Aadress
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Linn
                    </label>
                    <input
                      type="text"
                      value={contactInfo.office.city}
                      onChange={(e) =>
                        setContactInfo({
                          ...contactInfo,
                          office: {
                            ...contactInfo.office,
                            city: e.target.value,
                          },
                        })
                      }
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Tallinn"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Postiindeks
                    </label>
                    <input
                      type="text"
                      value={contactInfo.office.postal}
                      onChange={(e) =>
                        setContactInfo({
                          ...contactInfo,
                          office: {
                            ...contactInfo.office,
                            postal: e.target.value,
                          },
                        })
                      }
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="12345"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Tänav
                    </label>
                    <input
                      type="text"
                      value={contactInfo.office.street}
                      onChange={(e) =>
                        setContactInfo({
                          ...contactInfo,
                          office: {
                            ...contactInfo.office,
                            street: e.target.value,
                          },
                        })
                      }
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Tänava nimi ja number"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Ruum/Korter
                    </label>
                    <input
                      type="text"
                      value={contactInfo.office.room}
                      onChange={(e) =>
                        setContactInfo({
                          ...contactInfo,
                          office: {
                            ...contactInfo.office,
                            room: e.target.value,
                          },
                        })
                      }
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Ruum 123"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                >
                  Salvesta
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
