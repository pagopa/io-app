import { SpidIdp } from "../../../../../utils/idps";
import { Idp, Idps } from "../types/idps";

/**
 * Base URL of the CDN serving OneIdentity IDPs logos. The image for a given
 * IDP is available at `<CDN>/<base64url(entityID)>.png`, and its dark-mode
 * variant at `<CDN>/<base64url(entityID)>-dark.png`.
 */
const IDPS_LOGO_CDN_URL = "https://assets.oneid.pagopa.it/assets/idps";

/**
 * Computes the light and dark logo URLs for a given OneIdentity IDP
 * based on its base64url-encoded `entityID`.
 */
const getIdpLogos = (entityID: Idp["entityID"]) => {
  const encodedId = Buffer.from(entityID).toString("base64url");

  const baseUrl = `${IDPS_LOGO_CDN_URL}/${encodedId}`;

  return {
    light: { uri: `${baseUrl}.png` },
    dark: { uri: `${baseUrl}-dark.png` }
  };
};

/**
 * Converts a OneIdentity IDPs list into the local `SpidIdp` shape so that it
 * can be rendered by the existing `IdpsGrid` component without changes.
 */
export const fromIdpToLocalSpidIdp = (idps: Idps): ReadonlyArray<SpidIdp> =>
  idps.map(idp => ({
    id: idp.entityID,
    name: idp.friendlyName,
    logo: getIdpLogos(idp.entityID),
    profileUrl: ""
  }));

/**
 * Returns a new shuffled copy of the provided array using a random sort order.
 */
export const randomOrderIdps = <T extends object>(
  array: ReadonlyArray<T>
): Array<T> =>
  array
    .map(value => ({ value, sort: Math.random() })) // Assigns a random value to each array element
    .sort((a, b) => a.sort - b.sort) // Sorts the array according to the random values assigned
    .map(({ value }) => value); // Extract only the original values from the array
