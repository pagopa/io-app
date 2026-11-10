import { SpidIdp } from "../../../../../utils/idps";
import { Idp, Idps } from "../types/idps";

/**
 * Base URL of the CDN serving OneIdentity IDPs logos. The image for a given IDP
 * is available at `<CDN>/<base64url(entityID)>.png`, and its dark-mode variant
 * at `<CDN>/<base64url(entityID)>-dark.png`.
 */
const IDPS_LOGO_CDN_URL = "https://assets.oneid.pagopa.it/assets/idps";

/**
 * Computes the light and dark logo URLs for a given OneIdentity IDP based on
 * its base64url-encoded `entityID`.
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

/** Returns a new shuffled copy of the provided array using a random sort order. */
export const randomOrderIdps = <T>(array: ReadonlyArray<T>): Array<T> => {
  const result = [...array];
  // eslint-disable-next-line functional/no-let
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
