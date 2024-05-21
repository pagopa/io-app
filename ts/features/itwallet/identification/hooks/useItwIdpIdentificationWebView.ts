import {
  LoginUtilsError,
  openAuthenticationSession
} from "@pagopa/io-react-native-login-utils";
import * as O from "fp-ts/lib/Option";
import * as T from "fp-ts/lib/Task";
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

export const useItwIdpIdentificationWebView = () => {
  const dispatch = useIODispatch();

  const maybeKeyTag = useIOSelector(lollipopKeyTagSelector);
  const isFastLogin = useIOSelector(isFastLoginEnabledSelector);
  const mixpanelEnabled = useIOSelector(isMixpanelEnabled);

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const idpAuthSession = (
    loginUri: string
  ): TE.TaskEither<LoginUtilsError, string> =>
    pipe(loginUri, () =>
      TE.tryCatch(
        () => openAuthenticationSession(loginUri, "iologin"),
        error => error as LoginUtilsError
      )
    );

  const startIdentification = async (idp: LocalIdpsFallback) => {
    if (isLoading || O.isNone(maybeKeyTag)) {
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
      TE.fold(
        () => TE.of(undefined),
        url =>
          pipe(
            url,
            () => idpAuthSession(url),
            TE.fold(
              error => T.of(undefined),
              response => T.of(undefined)
            )
          )
      )
    )();
  };

  return {
    startIdentification,
    isLoading
  };
};
