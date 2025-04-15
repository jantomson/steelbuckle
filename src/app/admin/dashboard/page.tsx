"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/AdminSidebar";
import DashboardCard from "@/components/admin/DashboardCard";
import ResetConfirmationModal from "@/components/admin/ResetConfirmationModal";
import {
  FileText,
  Users,
  Phone,
  BarChart2,
  Activity,
  List,
  RefreshCw,
} from "lucide-react";

// Mock recharts components for development
const LineChart = ({ children, data, margin }: any) => <div>{children}</div>;
const Line = ({ type, dataKey, stroke, activeDot, name }: any) => null;
const XAxis = ({ dataKey, stroke }: any) => null;
const YAxis = ({ stroke }: any) => null;
const CartesianGrid = ({ strokeDasharray, stroke }: any) => null;
const Tooltip = () => null;
const Legend = () => null;
const ResponsiveContainer = ({ width, height, children }: any) => (
  <div className="h-full w-full">{children}</div>
);

export default function AdminDashboard() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("week"); // week, month, year
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Use useEffect to mark when the component is mounted
  useEffect(() => {
    setIsMounted(true);

    // Fetch CSRF token
    fetchCsrfToken();
  }, []);

  const fetchCsrfToken = async () => {
    try {
      const response = await fetch("/api/auth/csrf-token");
      const data = await response.json();
      if (data.csrfToken) {
        setCsrfToken(data.csrfToken);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch CSRF token:", error);
      setMessage(
        "Failed to initialize security. Some actions might be limited."
      );
      setMessageType("error");
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!csrfToken) {
      setMessage("Security token missing. Please refresh the page.");
      setMessageType("error");
      return;
    }

    try {
      // Use the CSRF token from cookie in the header
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken, // Use lowercase as in your implementation
        },
        credentials: "include", // Important to include credentials
      });

      if (response.ok) {
        // Redirect to login page after successful logout
        router.push("/admin/login");
      } else {
        // Handle error
        try {
          const data = await response.json();
          setMessage(data.error || "Väljalogimine ebaõnnestus");
        } catch (e) {
          setMessage(`Väljalogimine ebaõnnestus (${response.status})`);
        }
        setMessageType("error");
      }
    } catch (error) {
      console.error("Tekkis error:", error);
      setMessage("Midagi läks valesti, palun proovige uuesti");
      setMessageType("error");
    }
  };

  const handleResetButtonClick = () => {
    setIsResetModalOpen(true);
  };

  const handleResetConfirm = async () => {
    if (!csrfToken) {
      setMessage("Security token missing. Please refresh the page.");
      setMessageType("error");
      return;
    }

    setIsResetting(true);
    try {
      const response = await fetch("/api/reset-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken, // Use lowercase as in your implementation
        },
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setMessageType("success");
        setMessage(data.message || "Andmebaas on edukalt taastatud algseisu.");
      } else {
        setMessageType("error");
        setMessage(data.error || "Andmebaasi taastamine ebaõnnestus.");
      }
    } catch (error) {
      console.error("Reset error:", error);
      setMessageType("error");
      setMessage("Midagi läks valesti. Palun proovige uuesti.");
    } finally {
      setIsResetting(false);
      setIsResetModalOpen(false);
    }
  };

  // If not yet mounted, return a simple loading state to prevent hydration errors
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - hidden on mobile, shown on larger screens */}
        <Sidebar activePage="dashboard" onLogout={handleLogout} />

        {/* Main content - full width on mobile */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold">Töölaud</h2>
              <div className="hidden sm:flex items-center gap-4">
                <button
                  onClick={handleResetButtonClick}
                  className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  disabled={!csrfToken || isLoading}
                >
                  <RefreshCw size={16} />
                  <span className="text-sm font-medium">
                    Taasta algsätetele
                  </span>
                </button>
              </div>
            </div>

            {message && (
              <div
                className={`mb-4 p-3 sm:p-4 rounded-md ${
                  messageType === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {message}
                {messageType === "error" && (
                  <button
                    className="ml-2 underline text-sm"
                    onClick={fetchCsrfToken}
                  >
                    Uuenda turvatoken
                  </button>
                )}
              </div>
            )}

            {/* Mobile Reset Button */}
            <div className="sm:hidden mb-4">
              <button
                onClick={handleResetButtonClick}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                disabled={!csrfToken || isLoading}
              >
                <RefreshCw size={16} />
                <span className="text-sm font-medium">Taasta algsätetele</span>
              </button>
            </div>

            {/* Admin Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <DashboardCard
                title="Lehed"
                icon={<FileText size={24} className="text-green-600" />}
                link="/admin/pages"
                description="Muuda veebilehtede sisu"
              />
              <DashboardCard
                title="Projektid"
                icon={<Activity size={24} className="text-green-600" />}
                link="/admin/projects"
                description="Halda projekte"
              />
              <DashboardCard
                title="Kontaktinfo"
                icon={<Phone size={24} className="text-green-600" />}
                link="/admin/contacts"
                description="Uuenda andmeid"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <ResetConfirmationModal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          onConfirm={handleResetConfirm}
          isLoading={isResetting}
        />
      )}
    </div>
  );
}
