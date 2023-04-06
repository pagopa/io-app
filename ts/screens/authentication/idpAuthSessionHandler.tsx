import { pipe } from "fp-ts/lib/function";
import I18n from "i18n-js";
import * as React from "react";
import {
  openAuthenticationSession,
  getRedirects
} from "react-native-io-login-utils";
import * as O from "fp-ts/lib/Option";
import {
  CommonActions,
  useFocusEffect,
  useNavigation
} from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import URLParse from "url-parse";
import { store } from "../../boot/configureStoreAndPersistor";
import BaseScreenComponent, {
  ContextualHelpProps
} from "../../components/screens/BaseScreenComponent";
import { mixpanelTrack } from "../../mixpanel";
import {
  isLoggedOutWithIdp,
  selectedIdentityProviderSelector
} from "../../store/reducers/authentication";

import { extractLoginResult, getIdpLoginUri } from "../../utils/login";
import { idpContextualHelpDataFromIdSelector } from "../../store/reducers/content";
import Markdown from "../../components/ui/Markdown";
import IdpCustomContextualHelpContent from "../../components/screens/IdpCustomContextualHelpContent";
import NavigationService from "../../navigation/NavigationService";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import { trackLollipopIdpLoginFailure } from "../../utils/analytics";
import { lollipopKeyTagSelector } from "../../features/lollipop/store/reducers/lollipop";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import {
  DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER,
  lollipopSamlVerify
} from "../../features/lollipop/utils/login";
import { useHardwareBackButton } from "../../hooks/useHardwareBackButton";
import { handleRegenerateKey } from "../../features/lollipop";
import { assistanceToolConfigSelector } from "../../store/reducers/backendStatus";
import {
  assistanceToolRemoteConfig,
  handleSendAssistanceLog
} from "../../utils/supportAssistance";
import { loginFailure, loginSuccess } from "../../store/actions/authentication";
import { getSpidErrorCodeDescription } from "../../utils/spidErrorCode";
import { SessionToken } from "../../types/SessionToken";
import { IdpSuccessfulAuthentication } from "../../components/IdpSuccessfulAuthentication";
import {
  ErrorType,
  IdpAuthErrorScreen,
  IdpAuthErrorScreenType
} from "./idpAuthErrorScreen";

const getNativeCodeError = (error: string) => {
  const regex = /(?<=Code=)\d+/;
  const match = error.match(regex);
  return match ? match[0] : undefined;
};

export type AuthSessionErrorPageType = {
  contextualHelp: ContextualHelpProps;
  idpName: string;
  idpAuthErrorScreenProps: IdpAuthErrorScreenType;
};

type RequestInfoLoadingOrAuthorized = {
  requestState: "LOADING" | "AUTHORIZED";
};

type RequestInfoError = {
  requestState: "ERROR";
  errorType: ErrorType;
  errorCode?: string;
};

type RequestInfo = RequestInfoLoadingOrAuthorized | RequestInfoError;

const onBack = () =>
  NavigationService.dispatchNavigationAction(CommonActions.goBack());

// NativeCodeError 1 occurs when user cancels login.
const idpAuthSession = (loginUri: string): Promise<string> =>
  new Promise((resolve, reject) =>
    openAuthenticationSession(loginUri, "ioit")
      .then(value => resolve(value))
      .catch(error => {
        if (getNativeCodeError(error.toString()) !== "1") {
          reject(error.toString());
        } else {
          onBack();
        }
      })
  );

const regenerateKeyGetRedirectsAndVerifySaml = (
  loginUri: string,
  keyTag: string
): Promise<string> =>
  new Promise((resolve, reject) => {
    void handleRegenerateKey(keyTag)
      .then(publicKey => {
        if (!publicKey) {
          reject("Missing publicKey");
          return;
        }
        const headers = {
          "x-pagopa-lollipop-pub-key": Buffer.from(
            JSON.stringify(publicKey)
          ).toString("base64"),
          "x-pagopa-lollipop-pub-key-hash-algo":
            DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER
        };
        void getRedirects(loginUri, headers)
          .then(value => {
            for (const url of value) {
              const parsedUrl = new URLParse(url, true);
              const urlQuery = parsedUrl.query;
              if (urlQuery.SAMLRequest) {
                const urlEncodedSamlRequest = urlQuery.SAMLRequest;
                lollipopSamlVerify(
                  urlEncodedSamlRequest,
                  publicKey,
                  () => {
                    resolve(url);
                  },
                  (reason: string) => {
                    trackLollipopIdpLoginFailure(reason);
                    reject(reason);
                  }
                );
                break;
              }
            }
          })
          .catch(error => {console.log(error);reject(error);});
      })
      .catch(error => {console.log(error);reject(error);});
  });

export const AuthSessionPage = () => {
  // Normally, request is loading, otherwise there is an error
  const [requestInfo, setRequestInfo] = useState<RequestInfo>({
    requestState: "LOADING"
  });

  const dispatch = useIODispatch();

  const state = store.getState();

  const loggedOutWithIdpAuth = useMemo(
    () =>
      isLoggedOutWithIdp(state.authentication)
        ? state.authentication
        : undefined,
    [state.authentication]
  );

  const selectedIdp = useMemo(
    () => selectedIdentityProviderSelector(state),
    [state]
  );

  const selectedIdpTextData = useMemo(
    () =>
      pipe(
        selectedIdp,
        O.fromNullable,
        O.chain(idp => idpContextualHelpDataFromIdSelector(idp.id)(state))
      ),
    [selectedIdp, state]
  );

  const assistanceToolConfig = useMemo(
    () => assistanceToolConfigSelector(state),
    [state]
  );

  const choosenTool = useMemo(
    () => assistanceToolRemoteConfig(assistanceToolConfig),
    [assistanceToolConfig]
  );

  const idp = useMemo(
    () => loggedOutWithIdpAuth?.idp.id ?? "n/a",
    [loggedOutWithIdpAuth]
  );

  const handleLoginFailure = useCallback(
    (code?: string) => {
      dispatch(
        loginFailure({
          error: new Error(`login failure with code ${code || "n/a"}`),
          idp
        })
      );
      const logText = pipe(
        code,
        O.fromNullable,
        O.fold(
          () => "login failed with no error code available",
          ec =>
            `login failed with code (${ec}) : ${getSpidErrorCodeDescription(
              ec
            )}`
        )
      );

      handleSendAssistanceLog(choosenTool, logText);
      setRequestInfo({
        requestState: "ERROR",
        errorType: ErrorType.LOGIN_ERROR,
        errorCode: code
      });
    },
    [choosenTool, dispatch, idp]
  );

  const handleLoginSuccess = useCallback(
    (token: SessionToken) => {
      handleSendAssistanceLog(choosenTool, `login success`);
      dispatch(loginSuccess({ token, idp }));
    },
    [choosenTool, dispatch, idp]
  );

  // This function is executed when the native component resolve with an error or when loginUri is undefined.
  // This error is a string.
  // About the first case, unless there is a problem with the phone crashing for other reasons, this is very unlikely to happen.
  const handleLoadingError = useCallback(
    (error?: string) => {
      void mixpanelTrack("SPID_ERROR", {
        idp: loggedOutWithIdpAuth?.idp.id,
        description: error,
        errorType: ErrorType.LOADING_ERROR
      });

      setRequestInfo({
        requestState: "ERROR",
        errorType: ErrorType.LOADING_ERROR
      });
    },
    [loggedOutWithIdpAuth?.idp.id]
  );

  const contextualHelp = useMemo(() => {
    if (O.isNone(selectedIdpTextData)) {
      return {
        title: I18n.t("authentication.idp_login.contextualHelpTitle"),
        body: () => (
          <Markdown>
            {I18n.t("authentication.idp_login.contextualHelpContent")}
          </Markdown>
        )
      };
    }
    const idpTextData = selectedIdpTextData.value;
    return IdpCustomContextualHelpContent(idpTextData);
  }, [selectedIdpTextData]);

  const idpId = loggedOutWithIdpAuth?.idp.id;
  const loginUri = idpId ? getIdpLoginUri(idpId) : undefined;

  const maybeKeyTag = useIOSelector(lollipopKeyTagSelector);

  if (
    loginUri &&
    O.isSome(maybeKeyTag) &&
    requestInfo.requestState === "LOADING"
  ) {
    regenerateKeyGetRedirectsAndVerifySaml(loginUri, maybeKeyTag.value)
      .then((url: string) => {
        idpAuthSession(url)
          .then((response: string) => {
            const result = extractLoginResult(response);
            if (result?.success) {
              setRequestInfo({
                requestState: "AUTHORIZED"
              });
              handleLoginSuccess(result.token);
            } else {
              // If result is undefined or error,
              // it tries to extract error code and starts the handleLoginFailure flow.
              handleLoginFailure(result?.errorCode);
            }
          })
          .catch(error => handleLoadingError(error));
      })
      .catch(_ =>
        setRequestInfo({
          requestState: "ERROR",
          errorType: ErrorType.LOGIN_ERROR
        })
      );
  } else if (!loginUri) {
    handleLoadingError();
  } else if (O.isNone(maybeKeyTag)) {
    setRequestInfo({
      requestState: "ERROR",
      errorType: ErrorType.LOGIN_ERROR // VA AGGIUNTO UN CODICE DI ERRORE (anche dev server)??
    });
    trackLollipopIdpLoginFailure(
      "Missing keyTag while trying to login with lollipop"
    );
  }

  // QUESTO VA TESTATO SU ANDROID, Su ios tutto ok
  useHardwareBackButton(() => {
    if (requestInfo.requestState === "ERROR") {
      return true;
    }
    return false;
  });

  const navigation = useNavigation();
  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        gestureEnabled: requestInfo.requestState === "ERROR"
      });
    }, [navigation, requestInfo.requestState])
  );

  // It is enough to set the status to loading,
  // the reload will ensure that the functions necessary for correct functioning are performed.
  // These functions, in error state, are not re-executed
  const onRetry = () => setRequestInfo({ requestState: "LOADING" });

  if (requestInfo.requestState === "AUTHORIZED") {
    return <IdpSuccessfulAuthentication />;
  } else {
    return (
      <BaseScreenComponent
        goBack={requestInfo.requestState === "ERROR"}
        hideHelpButton={requestInfo.requestState !== "ERROR"}
        contextualHelp={contextualHelp}
        faqCategories={["authentication_SPID"]}
        headerTitle={`${I18n.t("authentication.idp_login.headerTitle")} - ${
          loggedOutWithIdpAuth.idp.name
        }`}
      >
        <LoadingSpinnerOverlay
          isLoading={requestInfo.requestState === "LOADING"}
        >
          {requestInfo.requestState === "ERROR" && (
            <IdpAuthErrorScreen
              requestStateError={requestInfo.errorType}
              errorCode={requestInfo.errorCode}
              onCancel={onBack}
              onRetry={onRetry}
            />
          )}
        </LoadingSpinnerOverlay>
      </BaseScreenComponent>
    );
  }
};
