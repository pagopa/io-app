/* eslint-disable @typescript-eslint/no-empty-function */
import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import { fromPromise } from "xstate5";
import { LocalIdpsFallback } from "../../../../utils/idps";
import { getIdpLoginUri } from "../../../../utils/login";

export default () => {
  const showSpidIdentificationWebView = fromPromise<string, LocalIdpsFallback>(
    async ({ input }) =>
      openAuthenticationSession(getIdpLoginUri(input.id, 2), "iologin")
  );
  const showCieIdWebView = fromPromise<string>(async () => "");
  const showCiePinWebView = fromPromise<string, string>(async () => "");
  const readCieCard = fromPromise<string, string>(async () => "");

  return {
    showSpidIdentificationWebView,
    showCieIdWebView,
    showCiePinWebView,
    readCieCard
  };
};
