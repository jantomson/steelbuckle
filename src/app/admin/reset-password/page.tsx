"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function resetPassword() {
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Enter username, Step 2: Enter new password
  const [csrfToken, setCsrfToken] = useState("");
  const router = useRouter();

  // Fetch CSRF token on component mount
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch("/api/auth/csrf-token");
        const data = await response.json();
        if (data.csrfToken) {
          setCsrfToken(data.csrfToken);
        }
      } catch (error) {
        console.error("Failed to fetch CSRF token:", error);
        setMessage("Failed to initialize security. Please refresh the page.");
        setIsError(true);
      }
    };

    fetchCsrfToken();
  }, []);

  const handleSubmitUsername = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!csrfToken) {
      setMessage("Security token missing. Please refresh the page.");
      setIsError(true);
      return;
    }

    // Validate username exists in database
    try {
      const response = await fetch("/api/auth/check-username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken, // Include the CSRF token in the header
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (response.ok && data.exists) {
        setStep(2); // Move to password reset step
        setMessage("");
        setIsError(false);
      } else {
        setMessage("Kasutajanime ei leitud");
        setIsError(true);
      }
    } catch (error) {
      setMessage("Midagi läks valesti, palun proovige uuesti");
      setIsError(true);
    }
  };

  // Password validation function
  const validatePassword = (
    password: string
  ): { valid: boolean; message: string } => {
    if (password.length < 8) {
      return {
        valid: false,
        message: "Parool peab olema vähemalt 8 tähemärki pikk",
      };
    }
    if (!/[A-Z]/.test(password)) {
      return {
        valid: false,
        message: "Parool peab sisaldama vähemalt üht suurtähte",
      };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return {
        valid: false,
        message: "Parool peab sisaldama vähemalt üht erimärki",
      };
    }
    return { valid: true, message: "" };
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!csrfToken) {
      setMessage("Security token missing. Please refresh the page.");
      setIsError(true);
      return;
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setMessage("Paroolid ei ühti");
      setIsError(true);
      return;
    }

    // Validate password requirements
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      setMessage(validation.message);
      setIsError(true);
      return;
    }

    // Send password reset request
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken, // Include the CSRF token in the header
        },
        body: JSON.stringify({ username, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Parool on edukalt muudetud");
        setIsError(false);
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push("/admin");
        }, 2000);
      } else {
        setMessage(data.error || "Parooli muutmine ebaõnnestus");
        setIsError(true);
      }
    } catch (error) {
      setMessage("Midagi läks valesti, palun proovige uuesti");
      setIsError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-600 p-4">
      <div className="w-full max-w-md space-y-6 p-6 sm:p-8 bg-white rounded-lg shadow-md">
        <div>
          <Link href="/" className="block text-center">
            <img
              src="/logo_dark.svg"
              alt="Steel Buckle"
              className="w-20 h-20 sm:w-24 sm:h-24 mx-auto"
            />
          </Link>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
            {step === 1 ? "Unustasid parooli?" : "Seadista uus parool"}
          </h2>
        </div>

        {message && (
          <div
            className={`text-sm text-center ${
              isError ? "text-red-500" : "text-green-500"
            }`}
          >
            {message}
          </div>
        )}

        {step === 1 ? (
          <form className="mt-6 space-y-6" onSubmit={handleSubmitUsername}>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Kasutajanimi
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:green-500 focus:border-green-500 sm:text-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:bg-green-800"
                disabled={!csrfToken}
              >
                Jätka
              </button>
            </div>

            <div className="text-center">
              <Link
                href="/admin/login"
                className="text-sm text-gray-600 hover:text-black"
              >
                Tagasi sisselogimisele
              </Link>
            </div>
          </form>
        ) : (
          <form className="mt-6 space-y-6" onSubmit={handleResetPassword}>
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Uus parool
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                Parool peab olema vähemalt 8 tähemärki pikk, sisaldama vähemalt
                üht suurtähte ja üht erimärki (!@#$%^&*()_+-=[]{}|;:'",./?).
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Kinnita uus parool
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-600 focus:border-green-600 sm:text-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-800"
                disabled={!csrfToken}
              >
                Muuda parool
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
