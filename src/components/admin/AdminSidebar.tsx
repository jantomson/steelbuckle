import { useState } from "react";
import Link from "next/link";

interface SidebarProps {
  activePage: string;
  onLogout?: () => void;
}

export default function Sidebar({ activePage, onLogout }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Fixed top navigation bar for mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-lg font-bold">Halduripaneel</h1>
        {!isMobileMenuOpen && (
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md bg-green-700 text-white hover:bg-green-600 focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Extra space for the content to not overlap with top navigation on mobile */}
      <div className="lg:hidden h-16"></div>

      {/* Sidebar for desktop */}
      <div className="hidden lg:block w-64 bg-white shadow-md min-h-screen p-4 flex-shrink-0">
        <div className="mb-8">
          <h1 className="text-xl font-bold mb-6">Halduripaneel</h1>
          {onLogout && (
            <button
              onClick={onLogout}
              className="bg-green-700 text-white px-4 py-2 rounded-md w-full hover:bg-green-600 transition-colors"
            >
              Logi välja
            </button>
          )}
        </div>
        <nav className="space-y-2">
          <Link
            href="/admin/dashboard"
            className={`block py-2 px-4 rounded hover:bg-green-100 transition-colors ${
              activePage === "dashboard"
                ? "bg-green-100 hover:bg-green-200"
                : ""
            }`}
          >
            Töölaud
          </Link>
          <Link
            href="/admin/pages"
            className={`block py-2 px-4 rounded hover:bg-green-100 transition-colors ${
              activePage === "pages" ? "bg-green-100 hover:bg-green-200" : ""
            }`}
          >
            Lehed
          </Link>
          <Link
            href="/admin/projects"
            className={`block py-2 px-4 rounded hover:bg-green-100 transition-colors ${
              activePage === "projects" ? "bg-green-100 hover:bg-green-200" : ""
            }`}
          >
            Projektid
          </Link>
          <Link
            href="/admin/contacts"
            className={`block py-2 px-4 rounded hover:bg-green-100 transition-colors ${
              activePage === "contacts" ? "bg-green-100 hover:bg-green-200" : ""
            }`}
          >
            Kontaktinfo
          </Link>
        </nav>
      </div>

      {/* Mobile sidebar - overlay that appears when menu button is clicked */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={toggleMobileMenu}
        >
          <div
            className="w-64 bg-white shadow-md h-full overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">Halduripaneel</h1>
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  aria-label="Close menu"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {onLogout && (
                <button
                  onClick={() => {
                    toggleMobileMenu();
                    onLogout();
                  }}
                  className="bg-green-700 text-white px-4 py-2 rounded-md w-full mb-6 hover:bg-green-600 transition-colors"
                >
                  Logi välja
                </button>
              )}

              <nav className="space-y-2">
                <Link
                  href="/admin/dashboard"
                  className={`block py-3 px-4 rounded hover:bg-green-100 transition-colors ${
                    activePage === "dashboard"
                      ? "bg-green-100 hover:bg-green-200"
                      : ""
                  }`}
                  onClick={toggleMobileMenu}
                >
                  Töölaud
                </Link>
                <Link
                  href="/admin/pages"
                  className={`block py-3 px-4 rounded hover:bg-green-100 transition-colors ${
                    activePage === "pages"
                      ? "bg-green-100 hover:bg-green-200"
                      : ""
                  }`}
                  onClick={toggleMobileMenu}
                >
                  Lehed
                </Link>
                <Link
                  href="/admin/projects"
                  className={`block py-3 px-4 rounded hover:bg-green-100 transition-colors ${
                    activePage === "projects"
                      ? "bg-green-100 hover:bg-green-200"
                      : ""
                  }`}
                  onClick={toggleMobileMenu}
                >
                  Projektid
                </Link>
                <Link
                  href="/admin/contacts"
                  className={`block py-3 px-4 rounded hover:bg-green-100 transition-colors ${
                    activePage === "contacts"
                      ? "bg-green-100 hover:bg-green-200"
                      : ""
                  }`}
                  onClick={toggleMobileMenu}
                >
                  Kontaktinfo
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
