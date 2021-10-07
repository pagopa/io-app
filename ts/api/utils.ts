import { map, pick } from "lodash";

/**
 * Attach a query string to the base string passed, if and only if there is
 * at least one defined parameter from the passlist.
 *
 */
export function paramsToQueryString(
  base: string,
  params: Record<string, unknown>,
  keys: Array<string>
): string {
  const queryParams = pick(params, keys);
  const queryString: string = map(queryParams, (value, key) => {
    if (value === undefined) {
      return "";
    }
    return `${key}=${value}`;
  }).join("&");

  if (queryString === "") {
    return base;
  }
  return `${base}?${queryString}`;
}
