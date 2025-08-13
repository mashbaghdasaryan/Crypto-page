export const fetchWithRetry = async (
  url,
  options = {},
  maxRetries = 3,
  retryDelay = 2000
) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);

      if (res.status === 429) {
        if (attempt === maxRetries) {
          throw new Error("API rate limit reached. Please try again later.");
        }
        await new Promise((r) => setTimeout(r, retryDelay * attempt)); 
        continue;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error ${res.status}: ${text}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      if (attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, retryDelay * attempt));
    }
  }
};
