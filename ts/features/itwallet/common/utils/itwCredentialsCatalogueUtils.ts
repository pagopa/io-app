import { CredentialsCatalogue } from "@pagopa/io-react-native-wallet";
import { Env } from "./environment";

export type DigitalCredentialsCatalogue = Awaited<
  ReturnType<typeof CredentialsCatalogue.fetchAndParseCatalogue>
>;

/**
 * Fetch the Digital Credentials Catalogue.
 *
 * @param env The environment to use for the Trust Anchor's base URL
 * @returns The credentials catalogue parsed JWT
 */
export const fetchCredentialsCatalogue = (env: Env) =>
  CredentialsCatalogue.fetchAndParseCatalogue(env.WALLET_TA_BASE_URL);
