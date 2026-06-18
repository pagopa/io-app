import {
  CredentialsCatalogue,
  ItwVersion
} from "@pagopa/io-react-native-wallet";
import { Env } from "./environment";
import { getIoWallet } from "./itwIoWallet";

export type DigitalCredentialsCatalogue =
  CredentialsCatalogue.DigitalCredentialsCatalogue;

export type DigitalCredentialMetadata =
  DigitalCredentialsCatalogue["credentials"][number];

export type CatalogueTranslations = CredentialsCatalogue.CatalogueTranslations;

/**
 * Fetch the Digital Credentials Catalogue.
 *
 * @param env The environment to use for the Trust Anchor's base URL
 * @param itwVersion - IT-Wallet technical specs version
 * @returns The credentials catalogue parsed JWT
 */
export const fetchCredentialsCatalogue = (env: Env, itwVersion: ItwVersion) =>
  getIoWallet(itwVersion).CredentialsCatalogue.fetchAndParseCatalogue(
    env.WALLET_TA_BASE_URL
  );

/**
 * Fetch locale bundles for the credential catalogue and authentic sources.
 * Only available for IT-Wallet spec v1.3.3. Returns an empty object if the
 * catalogue carries no localization metadata or the API is unavailable.
 *
 * @param itwVersion - IT-Wallet technical specs version
 * @param catalogue - A previously fetched Digital Credentials Catalogue
 * @param locales - Array of locale codes to fetch (e.g. ["it", "en"])
 * @returns Translations keyed by locale, then by l10n_id
 */
export const fetchCatalogueTranslations = async (
  itwVersion: ItwVersion,
  catalogue: DigitalCredentialsCatalogue,
  locales: Array<string>
): Promise<CatalogueTranslations> => {
  const { fetchTranslations } = getIoWallet(itwVersion).CredentialsCatalogue;

  if (!fetchTranslations) {
    return {};
  }

  return fetchTranslations(
    {
      catalogue: catalogue.localization,
      authenticSources: catalogue.as_localization
    },
    locales
  );
};
