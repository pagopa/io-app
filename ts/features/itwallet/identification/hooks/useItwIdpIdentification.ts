import {
  LoginUtilsError,
  openAuthenticationSession
} from "@pagopa/io-react-native-login-utils";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { LocalIdpsFallback } from "../../../../utils/idps";
import { getIdpLoginUri } from "../../../../utils/login";
import {
  ItWalletError,
  ItWalletErrorTypes
} from "../../common/utils/itwErrorsUtils";

const URL_LOGIN_SCHEME = "iologin";

export const useItwIdpIdentification = () => {
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [result, setResult] = React.useState<string>();
  const [error, setError] = React.useState<ItWalletError>();

  const startIdentification = async (idp: LocalIdpsFallback) => {
    if (isPending) {
      return;
    }
    setIsPending(true);

    void pipe(
      TE.tryCatch(
        () =>
          openAuthenticationSession(
            getIdpLoginUri(idp.id, 2),
            URL_LOGIN_SCHEME
          ),
        error => {
          setError({ code: ItWalletErrorTypes.IDENTIFICATION_ERROR });
          return error as LoginUtilsError;
        }
      ),
      TE.map(setResult)
    )();
  };

  return {
    startIdentification,
    isPending,
    error,
    result
  };
};
