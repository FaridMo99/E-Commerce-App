export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function getCsrfHeader(): Record<string, string> {
  const csrfToken = document.cookie
    .split("; ")
    .find(row => row.startsWith("csrfToken="))
    ?.split("=")[1];

  if (!csrfToken) {
    console.log("CSRF token not found in cookies");
    return {};
  }

  return { "x-csrf-token": csrfToken };
}