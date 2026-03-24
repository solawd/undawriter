export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const userStr = localStorage.getItem("user");
  const headers = new Headers(options.headers);

  if (userStr) {
    const user = JSON.parse(userStr);
    if (user.token) {
      headers.set("Authorization", `Bearer ${user.token}`);
    }
  }

  // Only set Content-Type to application/json if it's not FormData
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, {
    ...options,
    headers,
  });
};
