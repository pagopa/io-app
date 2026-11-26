import { openCieIdApp } from "@pagopa/io-react-native-cieid";
import { useCallback, useEffect } from "react";
import { Linking } from "react-native";

import { isAndroid, isIos } from "../../../../utils/platform";
import { CIE_ENVS, CieEnv } from "../../login/cie/utils";
import {
  CIE_ID_ERROR,
  CIE_ID_ERROR_MESSAGE,
  IO_LOGIN_CIE_SOURCE_APP,
  IO_LOGIN_CIE_URL_SCHEME
} from "../../login/cie/utils/cie";
import { LoginFailure } from "../utils/loginFailure";

/**
 * Extracts the error message from a CIE ID app deep-link (`iologincie://...`)
 * received via `Linking` after the user returns from the CieID app. The
 * presence of the `CIE_ID_ERROR` marker in `url` indicates the CieID flow
 * failed; in that case the error message following `CIE_ID_ERROR_MESSAGE` is
 * returned. Returns `undefined` when `url` does not represent an error
 */
const extractCieIdErrorFromUrl = (url: string): string | undefined => {
  if (!url.includes(CIE_ID_ERROR)) {
    return undefined;
  }
  const [, errorMessage] = url.split(CIE_ID_ERROR_MESSAGE);
  return errorMessage;
};

/** The `code` of a native module rejection (e.g. `EUNSPECIFIED`), if any. */
const getErrorCode = (error: unknown): string | undefined =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  typeof error.code === "string"
    ? error.code
    : undefined;

type UseCieIdApp = (params: {
  /** CIE environment targeted by the CieID app. Defaults to production. */
  cieEnv?: CieEnv;
  /** Handler called upon failure of the CIE authentication flow. */
  onFailure: (failure: LoginFailure) => void;
  /** Handler called upon successful CIE authentication flow. */
  onSuccess: (authenticationUrl: string) => void;
}) => {
  startCieIdApp: (url: string) => void;
};

export const useCieIdApp: UseCieIdApp = ({
  cieEnv = CIE_ENVS.PROD,
  onFailure,
  onSuccess
}) => {
  useEffect(() => {
    const urlListenerSubscription = Linking.addEventListener(
      "url",
      ({ url }) => {
        if (!url.startsWith(IO_LOGIN_CIE_URL_SCHEME)) {
          return;
        }

        const [, continueUrl] = url.split(IO_LOGIN_CIE_URL_SCHEME);
        const cieIdError = extractCieIdErrorFromUrl(continueUrl);

        if (cieIdError) {
          onFailure({
            kind: "cieIdApp",
            details: { errorMessage: cieIdError }
          });
          return;
        }

        onSuccess(continueUrl);
      }
    );

    return () => urlListenerSubscription.remove();
  }, [onFailure, onSuccess]);

  const startCieIdApp = useCallback(
    (url: string) => {
      // Use the CieID app-to-app flow on Android
      if (isAndroid) {
        openCieIdApp(
          url,
          result => {
            if (result.id === "URL") {
              onSuccess(result.url);
            } else {
              onFailure({
                kind: "cieIdApp",
                details: { errorCode: result.code }
              });
            }
          },
          cieEnv
        );
      }

      // Try to directly open the CieID app on iOS
      if (isIos) {
        const cieIdAppUrl = `CIEID://${url}&sourceApp=${IO_LOGIN_CIE_SOURCE_APP}`;
        Linking.openURL(cieIdAppUrl).catch((error: unknown) =>
          onFailure({
            kind: "idpAppNotOpened",
            // The rejection message is just the URL with a prefix
            details: { code: getErrorCode(error), url: cieIdAppUrl }
          })
        );
      }
    },
    [cieEnv, onFailure, onSuccess]
  );

  return {
    startCieIdApp
  };
};
