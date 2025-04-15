import {
  Page,
  Region,
  ApiResponse,
  AuthResponse,
  LoginCredentials,
  PaginatedResponse,
  Media,
} from "../types/content";

// Base API URL - change in production
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Helper to get stored auth token
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
};

// Generic fetch wrapper with error handling
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "API request failed");
  }

  return data;
}

// Authentication
export async function login(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  const data = await fetchAPI<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  // Store authentication data
  if (data.token) {
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  return data;
}

export function logout(): void {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user");
  window.location.href = "/admin/login";
}

// Pages
export async function getPages(): Promise<Page[]> {
  return fetchAPI<Page[]>("/pages");
}

export async function getPage(slug: string): Promise<Page> {
  return fetchAPI<Page>(`/pages/${slug}`);
}

export async function updatePage(
  slug: string,
  data: { regions: Region[] }
): Promise<Page> {
  return fetchAPI<Page>(`/pages/${slug}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Media Library
export async function getMedia(
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse<Media>> {
  return fetchAPI<PaginatedResponse<Media>>(
    `/media?page=${page}&limit=${limit}`
  );
}

export async function uploadMedia(file: File): Promise<Media> {
  const formData = new FormData();
  formData.append("file", file);

  const token = getAuthToken();

  const response = await fetch(`${API_URL}/media`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Note: Don't set Content-Type here - browser will set it properly with boundary
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to upload media");
  }

  return data;
}

export async function deleteMedia(id: string): Promise<void> {
  await fetchAPI<void>(`/media/${id}`, {
    method: "DELETE",
  });
}

// Preview functionality
export function getPreviewUrl(slug: string): string {
  const token = getAuthToken();
  if (!token) return `/${slug}`;

  return `/${slug}?preview=true&token=${encodeURIComponent(token)}`;
}

// Check authentication status
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
