import { Errors } from "@pagopa/io-react-native-wallet";
import { createSelector } from "reselect";

import { itwCredentialsSelector } from ".";
import { GlobalState } from "../../../../../store/reducers/types";
import { selectItwSpecsVersion } from "../../../common/store/selectors/environment";
import { getClaimsFullLocale } from "../../../common/utils/itwClaimsUtils";
import { getCredentialStatus } from "../../../common/utils/itwCredentialStatusUtils";
import { getIoWallet } from "../../../common/utils/itwIoWallet";
import { ItwCredentialStatus } from "../../../common/utils/itwTypesUtils";
import {
  itwCatalogueTranslationsByLocaleSelector,
  itwCredentialsCatalogueByTypesSelector
} from "../../../credentialsCatalogue/store/selectors";

type CredentialStatusObject = {
  message: undefined | { description?: string; title?: string };
  status: ItwCredentialStatus | undefined;
};

/**
 * Get the credential status and the error message corresponding to the status assertion error, if present.
 * The message is dynamic and extracted from the issuer configuration.
 *
 * Note: the credential type is passed as second argument to reuse the same selector and cache per credential type.
 *
 * @param state - The global state.
 * @param type - The credential type.
 * @returns The credential status and the error message corresponding to the status assertion error, if present.
 */
export const itwCredentialStatusSelector = createSelector(
  selectItwSpecsVersion,
  itwCredentialsSelector,
  itwCredentialsCatalogueByTypesSelector,
  itwCatalogueTranslationsByLocaleSelector,
  (_state: GlobalState, type: string) => type,
  (
    itwVersion,
    credentials,
    catalog,
    catalogTranslations,
    type
  ): CredentialStatusObject => {
    const credential = credentials[type];

    // This should never happen
    if (credential === undefined) {
      return { status: undefined, message: undefined };
    }

    const status = getCredentialStatus(credential);

    if (!credential.validity) {
      return { status, message: undefined };
    }

    if (credential.validity.type === "status_assertion") {
      const errorCode =
        credential.validity.status === "invalid"
          ? credential.validity.errorCode
          : undefined;
      if (errorCode) {
        const messagesByLocale = Errors.extractErrorMessageFromIssuerConf(
          errorCode,
          {
            issuerConf: credential.issuerConf,
            credentialType: credential.credentialId
          }
        );

        return {
          status,
          message: messagesByLocale
            ? messagesByLocale[getClaimsFullLocale()]
            : undefined
        };
      }

      return { status, message: undefined };
    }

    if (!catalog?.[credential.credentialType]) {
      return { status, message: undefined };
    }

    const message = getIoWallet(
      itwVersion
    ).CredentialsCatalogue.getStatusL10nIds(
      credential.validity.rawStatus,
      catalog[credential.credentialType]
    );

    return {
      status,
      message:
        message && catalogTranslations
          ? {
              title: catalogTranslations[message.titleL10nId],
              description: catalogTranslations[message.descriptionL10nId]
            }
          : undefined
    };
  }
);
