/**
 * Reads a query parameter from a URL.
 *
 * @param url - The URL to read from. A malformed URL yields `undefined` rather than throwing.
 * @param paramName - The name of the query parameter.
 * @returns The parameter value, `undefined` when the URL is invalid or the parameter is missing.
 */
export const getUrlParam = (
  url: string,
  paramName: string
): string | undefined => {
  try {
    return new URL(url).searchParams.get(paramName) ?? undefined;
  } catch {
    return undefined;
  }
};
