/* eslint-disable @typescript-eslint/no-empty-function */
import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { fromPromise } from "xstate5";
import { AppDispatch } from "../../../../App";
import { LocalIdpsFallback } from "../../../../utils/idps";
import { getIdpLoginUri } from "../../../../utils/login";
import { regenerateKeyGetRedirectsAndVerifySaml } from "../../../lollipop/utils/login";

export const createIdentificationActorsImplementation = (
  maybeKeyTag: O.Option<string>,
  isMixpanelEnabled: boolean | null,
  isFastLogin: boolean,
  dispatch: AppDispatch
) => {
  const showSpidIdentificationWebView = fromPromise<string, LocalIdpsFallback>(
    async ({ input }) => {
      if (O.isSome(maybeKeyTag)) {
        const loginUrl = await regenerateKeyGetRedirectsAndVerifySaml(
          getIdpLoginUri(input.id, 2),
          maybeKeyTag.value,
          isMixpanelEnabled,
          isFastLogin,
          dispatch
        );

        if (E.isLeft(loginUrl)) {
          return Promise.reject();
        }

        return await openAuthenticationSession(loginUrl.right, "iologin");
      }

      return Promise.reject();
    }
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
