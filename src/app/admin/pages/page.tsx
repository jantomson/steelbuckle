"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/AdminSidebar";

export default function AdminPages() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  // Updated list of pages to edit - removed descriptions
  const pages = [
    { id: "home", title: "Avaleht" },
    { id: "about", title: "Ettevõttest" },
    { id: "projects", title: "Tehtud tööd" },
    { id: "contact", title: "Kontakt" },
    // Railway subpages
    { id: "railway-repair", title: "Raudteede remont ja renoveerimine" },
    { id: "railway-design", title: "Raudteede projekteerimine" },
    { id: "railway-maintenance", title: "Raudteede jooksev korrashoid" },
    { id: "railway-infrastructure", title: "Raudtee infrastruktuuri ehitus" },
  ];

  // Go to the simple page editor
  const editPage = (pageId: string) => {
    router.push(`/admin/pages/edit/${pageId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <Sidebar activePage="pages" />

        {/* Main content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
              Lehtede muutmine
            </h2>

            {message && (
              <div className="mb-4 p-3 sm:p-4 rounded-md bg-green-100 text-green-700">
                {message}
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                Vali leht muutmiseks
              </h2>
              <p className="text-gray-600 mb-4 sm:mb-6">
                Vali allolev leht selle sisu muutmiseks meie visuaalse
                redaktoriga.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {pages.map((page) => (
                  <div
                    key={page.id}
                    onClick={() => editPage(page.id)}
                    className="border rounded-lg p-3 sm:p-4 hover:bg-green-50 cursor-pointer transition-colors"
                  >
                    <h3 className="text-base sm:text-lg font-medium">
                      {page.title}
                    </h3>
                    <div className="mt-3 sm:mt-4 text-green-500 text-sm">
                      Kliki muutmiseks →
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
