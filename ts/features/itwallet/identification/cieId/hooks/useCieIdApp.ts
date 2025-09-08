import { useCallback, useEffect, useState } from "react";
import * as O from "fp-ts/lib/Option";
import { Linking } from "react-native";
import * as t from "io-ts";
import { CieIdErrorResult, openCieIdApp } from "@pagopa/io-react-native-cieid";
import { pipe } from "fp-ts/lib/function";
import {
  CIE_ID_ERROR,
  CIE_ID_ERROR_MESSAGE,
  IO_LOGIN_CIE_SOURCE_APP,
  IO_LOGIN_CIE_URL_SCHEME
} from "../../../../authentication/login/cie/utils/cie";
import { isAndroid, isIos } from "../../../../../utils/platform";
import { convertUnknownToError } from "../../../../../utils/errors";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";

type CieIdHookResult = {
  /**
   * The authentication url obtained after a successful identification through CieID.
   */
  authUrl: O.Option<string>;
  /**
   * Whether the CieID app has been opened separately from IO (iOS only).
   */
  isAppLaunched: boolean;
  /**
   * Function that starts the authentication with CieID.
   */
  startCieIdAppAuthentication: (url: string) => void;
  /**
   * Function that handles CieID related errors.
   */
  handleAuthenticationFailure: (error: unknown) => void;
};

const cieIdAppError = t.type({
  id: t.literal("ERROR"),
  code: t.string
});

const isCieIdAppError = (e: unknown): e is CieIdErrorResult =>
  cieIdAppError.is(e);

const extractCieIdErrorFromUrl = (url: string) =>
  pipe(
    url,
    O.fromPredicate(x => x.includes(CIE_ID_ERROR)),
    O.map(
      x => x.split(CIE_ID_ERROR_MESSAGE)[1] ?? "Unexpected error from CieID"
    ),
    O.toUndefined
  );

/**
 * Hook that contains CieID related logic and handlers.
 * @returns CieIdHookResult: {@link CieIdHookResult}
 */
export const useCieIdApp = (): CieIdHookResult => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const [authUrl, setAuthUrl] = useState<O.Option<string>>(O.none);
  const [isAppLaunched, setIsAppLaunched] = useState(false);

  const sendErrorToMachine = useCallback(
    (error: Error) => {
      machineRef.send({ type: "error", scope: "cieid-login", error });
    },
    [machineRef]
  );

  const goBack = useCallback(
    () => machineRef.send({ type: "back" }),
    [machineRef]
  );

  const handleAuthenticationFailure = useCallback(
    (error: unknown) => {
      if (isCieIdAppError(error)) {
        return error.code === "CIEID_OPERATION_CANCEL"
          ? goBack()
          : sendErrorToMachine(new Error(error.code));
      }

      sendErrorToMachine(convertUnknownToError(error));
    },
    [sendErrorToMachine, goBack]
  );

  const startCieIdAppAuthentication = useCallback(
    (url: string) => {
      // Use the new CieID app-to-app flow on Android
      if (isAndroid) {
        openCieIdApp(url, result => {
          if (result.id === "URL") {
            setAuthUrl(O.some(result.url));
          } else {
            handleAuthenticationFailure(result);
          }
        });
      }

      // Try to directly open the CieID app on iOS
      if (isIos) {
        Linking.openURL(`CIEID://${url}&sourceApp=${IO_LOGIN_CIE_SOURCE_APP}`)
          .then(() => setIsAppLaunched(true))
          .catch(handleAuthenticationFailure);
      }
    },
    [handleAuthenticationFailure]
  );

  useEffect(() => {
    // Listen for a URL event to continue the flow. This is only needed on iOS,
    // as the CieID app is opened with the Linking module.
    const urlListenerSubscription = Linking.addEventListener(
      "url",
      ({ url }) => {
        if (!url.startsWith(IO_LOGIN_CIE_URL_SCHEME)) {
          return;
        }

        const [, continueUrl] = url.split(IO_LOGIN_CIE_URL_SCHEME);
        const cieIdError = extractCieIdErrorFromUrl(continueUrl);

        if (cieIdError) {
          return sendErrorToMachine(new Error(cieIdError));
        }

        setAuthUrl(O.some(continueUrl));
        setIsAppLaunched(false);
      }
    );

    return () => urlListenerSubscription.remove();
  }, [sendErrorToMachine]);

  return {
    authUrl,
    isAppLaunched,
    startCieIdAppAuthentication,
    handleAuthenticationFailure
  };
};
