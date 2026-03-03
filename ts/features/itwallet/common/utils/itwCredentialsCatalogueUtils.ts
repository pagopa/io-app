import { CredentialsCatalogue, IoWallet } from "@pagopa/io-react-native-wallet";
import { Env } from "./environment";

export type DigitalCredentialsCatalogue =
  CredentialsCatalogue.DigitalCredentialsCatalogue;

export type DigitalCredentialMetadata =
  DigitalCredentialsCatalogue["credentials"][number];

/**
 * Fetch the Digital Credentials Catalogue.
 *
 * @param env The environment to use for the Trust Anchor's base URL
 * @returns The credentials catalogue parsed JWT
 */
export const fetchCredentialsCatalogue = (env: Env) => {
  const wallet = new IoWallet({ version: "1.0.0" });
  return wallet.CredentialsCatalogue.fetchAndParseCatalogue(
    env.WALLET_TA_BASE_URL
  );
};
