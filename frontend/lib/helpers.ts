export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function getCsrfHeaderClientSide(): Record<string, string> {
  const csrfToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrfToken="))
    ?.split("=")[1];

  if (!csrfToken) {
    console.log("CSRF token not found in cookies");
    return {};
  }

  return { "x-csrf-token": csrfToken };
}

export function stripContentLengthHeader(header:Record<string,string>):Record<string,string> {
    const {
      "content-length": _,
      "Content-Length": __,
      ...safeHeaders
    } = header;
  
  return safeHeaders
}