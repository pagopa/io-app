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

type UseCieIdApp = (params: {
  /** CIE environment targeted by the CieID app. Defaults to production. */
  cieEnv?: CieEnv;
  /** Handler called upon failure of the CIE authentication flow. */
  onFailure: (error: string) => void;
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
          onFailure(cieIdError);
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
              onFailure(result.code);
            }
          },
          cieEnv
        );
      }

      // Try to directly open the CieID app on iOS
      if (isIos) {
        Linking.openURL(
          `CIEID://${url}&sourceApp=${IO_LOGIN_CIE_SOURCE_APP}`
        ).catch(onFailure);
      }
    },
    [cieEnv, onFailure, onSuccess]
  );

  return {
    startCieIdApp
  };
};
