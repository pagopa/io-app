import {
  CredentialsCatalogue,
  ItwVersion
} from "@pagopa/io-react-native-wallet";
import { Env } from "./environment";
import { ioWalletManager } from "./itwIoWallet";

export type DigitalCredentialsCatalogue =
  CredentialsCatalogue.DigitalCredentialsCatalogue;

export type DigitalCredentialMetadata =
  DigitalCredentialsCatalogue["credentials"][number];

/**
 * Fetch the Digital Credentials Catalogue.
 *
 * @param env The environment to use for the Trust Anchor's base URL
 * @param itwVersion - IT-Wallet technical specs version
 * @returns The credentials catalogue parsed JWT
 */
export const fetchCredentialsCatalogue = (env: Env, itwVersion: ItwVersion) =>
  ioWalletManager
    .get(itwVersion)
    .CredentialsCatalogue.fetchAndParseCatalogue(env.WALLET_TA_BASE_URL);
