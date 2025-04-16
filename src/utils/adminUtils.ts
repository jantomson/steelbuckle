// utils/adminUtils.ts

// Function to detect if we're in the admin section
export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

// Function to disable links or modify behavior in admin context
export function shouldDisableLanguageSwitching(pathname: string): boolean {
  // Optional: You can add more specific rules here
  return isAdminRoute(pathname);
}

// If needed, create a function to extract the current page ID from admin URL
export function getAdminPageId(pathname: string): string | null {
  // Match patterns like /admin/pages/edit/home
  const match = pathname.match(/\/admin\/pages\/edit\/([^\/]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}
