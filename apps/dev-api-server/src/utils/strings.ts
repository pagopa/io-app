import { basePath } from "../payloads/response";

export const uuidv4 = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    // eslint-disable-next-line no-bitwise
    const a = (Math.random() * 16) | 0;
    // eslint-disable-next-line no-bitwise
    const b = c === "x" ? a : (a & 0x3) | 0x8;
    return b.toString(16);
  });

/**
 * Creates a function that prefixes API endpoints with a namespace and version.
 *
 * @param namespace - The endpoint namespace prefix (e.g. "auth")
 * @param version - The endpoint version (default is "v1")
 * @returns A function that takes a path and returns the full API endpoint
 *
 * @example
 * const addApiAuthV1Prefix = createNamespaceVersionPrefixer("auth");
 * addApiAuthV1Prefix("/login"); // "/api/auth/v1/login"
 */
const createNamespaceVersionPrefixer =
  (namespace: string, version = "v1") =>
  (path: `/${string}`) =>
    `/api/${namespace}/${version}${path}`;

export const addApiV1Prefix = (path: string) => `${basePath}${path}`;
export const addApiAuthV1Prefix = createNamespaceVersionPrefixer("auth");
export const addApiCatalogV1Prefix = createNamespaceVersionPrefixer("catalog");
export const addApiCommunicationV1Prefix =
  createNamespaceVersionPrefixer("communication");
export const addApiIdentityV1Prefix =
  createNamespaceVersionPrefixer("identity");
export const addApiFimsV1Prefix = createNamespaceVersionPrefixer("fims");
export const addApiSignV1Prefix = createNamespaceVersionPrefixer("sign");
