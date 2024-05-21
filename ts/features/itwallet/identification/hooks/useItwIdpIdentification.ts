import {
  LoginUtilsError,
  openAuthenticationSession
} from "@pagopa/io-react-native-login-utils";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isMixpanelEnabled } from "../../../../store/reducers/persistedPreferences";
import { LocalIdpsFallback } from "../../../../utils/idps";
import { getIdpLoginUri } from "../../../../utils/login";
import { isFastLoginEnabledSelector } from "../../../fastLogin/store/selectors";
import { lollipopKeyTagSelector } from "../../../lollipop/store/reducers/lollipop";
import { regenerateKeyGetRedirectsAndVerifySaml } from "../../../lollipop/utils/login";
import {
  ItWalletError,
  ItWalletErrorTypes
} from "../../common/utils/itwErrorsUtils";

const URL_LOGIN_SCHEME = "iologin";

export type IdentificationResultCallbackFn = (resultUrl: string) => void;

export const useItwIdpIdentification = (
  onIdentificationResult: IdentificationResultCallbackFn
) => {
  const dispatch = useIODispatch();

  const maybeKeyTag = useIOSelector(lollipopKeyTagSelector);
  const isFastLogin = useIOSelector(isFastLoginEnabledSelector);
  const mixpanelEnabled = useIOSelector(isMixpanelEnabled);

  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [error, setError] = React.useState<ItWalletError>();

  const idpAuthSession = (
    loginUri: string
  ): TE.TaskEither<Error | LoginUtilsError, string> =>
    TE.tryCatch(
      () => {
        setIsPending(true);
        return openAuthenticationSession(loginUri, URL_LOGIN_SCHEME);
      },
      error => {
        setError({ code: ItWalletErrorTypes.CREDENTIAL_ADD_ERROR });
        return error as LoginUtilsError;
      }
    );

  const startIdentification = async (idp: LocalIdpsFallback) => {
    if (isPending || O.isNone(maybeKeyTag)) {
      return;
    }

    void pipe(
      () =>
        regenerateKeyGetRedirectsAndVerifySaml(
          getIdpLoginUri(idp.id, 2),
          maybeKeyTag.value,
          mixpanelEnabled,
          isFastLogin,
          dispatch
        ),
      TE.chain(idpAuthSession),
      TE.map(onIdentificationResult)
    )();
  };

  return {
    startIdentification,
    isPending,
    error
  };
};
