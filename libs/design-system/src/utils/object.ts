// Function to find the first case-insensitive logo
export const findFirstCaseInsensitive = <T>(
  obj: { [key: string]: T },
  key: string
) => {
  const lowerKey = key.toLowerCase();
  for (const [k] of Object.entries(obj)) {
    if (k.toLowerCase() === lowerKey) {
      return k;
    }
  }
  return null;
};
