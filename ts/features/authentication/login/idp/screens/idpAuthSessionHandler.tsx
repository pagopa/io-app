/* eslint-disable import/order */
import {
  LoginUtilsError,
  Error as LoginUtilsErrorType,
  openAuthenticationSession
} from "@pagopa/io-react-native-login-utils";
import { CommonActions, useFocusEffect } from "@react-navigation/native";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import { useCallback, useEffect, useMemo } from "react";
import { AppState, SafeAreaView, StyleSheet, View } from "react-native";
import I18n from "i18next";
import { mixpanelTrack } from "../../../../../mixpanel";

import {
  Body,
  H6,
  IOButton,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import { IdpData } from "../../../../../../definitions/content/IdpData";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import { useHardwareBackButton } from "../../../../../hooks/useHardwareBackButton";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import NavigationService from "../../../../../navigation/NavigationService";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../../store/hooks";
import { assistanceToolConfigSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { idpContextualHelpDataFromIdSelector } from "../../../../../store/reducers/content";
import { isMixpanelEnabled } from "../../../../../store/reducers/persistedPreferences";
import themeVariables from "../../../../../theme/variables";
import { SessionToken } from "../../../../../types/SessionToken";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import {
  assistanceToolRemoteConfig,
  handleSendAssistanceLog
} from "../../../../../utils/supportAssistance";
import { ephemeralKeyTagSelector } from "../../../../lollipop/store/reducers/lollipop";
import { regenerateKeyGetRedirectsAndVerifySaml } from "../../../../lollipop/utils/login";
import { IdpSuccessfulAuthentication } from "../../../common/components/IdpSuccessfulAuthentication";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import {
  disableNativeAuthentication,
  loginFailure,
  loginSuccess
} from "../../../common/store/actions";
import { selectedIdentityProviderSelector } from "../../../common/store/selectors";
import {
  extractLoginResult,
  getEitherLoginResult,
  getIdpLoginUri
} from "../../../common/utils/login";
import { isFastLoginEnabledSelector } from "../../../fastLogin/store/selectors";
import { setNativeLoginRequestInfo } from "../store/actions";
import { nativeLoginRequestInfoSelector } from "../store/selectors";
import { getSpidErrorCodeDescription } from "../utils/spidErrorCode";
import {
  isActiveSessionFastLoginEnabledSelector,
  isActiveSessionLoginSelector,
  remoteApiLoginUrlPrefixSelector
} from "../../../activeSessionLogin/store/selectors";

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 56
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: themeVariables.contentPadding
  },
  title: {
    textAlign: "center"
  }
});

export enum ErrorType {
  "LOADING_ERROR" = "LOADING_ERROR",
  "LOGIN_ERROR" = "LOGIN_ERROR"
}

type RequestInfoPositiveStates = {
  requestState: "LOADING" | "AUTHORIZED" | "AUTHORIZING";
  nativeAttempts: number;
};

type RequestInfoError = {
  requestState: "ERROR";
  errorType: ErrorType;
  errorCodeOrMessage?: string;
  nativeAttempts: number;
};

type RequestInfo = RequestInfoPositiveStates | RequestInfoError;

const isBackButtonEnabled = (requestInfo: RequestInfo): boolean =>
  requestInfo.requestState === "AUTHORIZING" ||
  requestInfo.requestState === "ERROR";

const onBack = () =>
  NavigationService.dispatchNavigationAction(CommonActions.goBack());

const idpAuthSession = (
  loginUri: string
): TE.TaskEither<LoginUtilsError, string> =>
  pipe(loginUri, () =>
    TE.tryCatch(
      () => openAuthenticationSession(loginUri, "iologin"),
      error => error as LoginUtilsError
    )
  );

// This page is used in the native login process.
export const AuthSessionPage = () => {
  const dispatch = useIODispatch();
  const requestInfo = useIOSelector(nativeLoginRequestInfoSelector);
  const mixpanelEnabled = useIOSelector(isMixpanelEnabled);
  const isActiveSessionLogin = useIOSelector(isActiveSessionLoginSelector);
  const isActiveSessionFastLogin = useIOSelector(
    isActiveSessionFastLoginEnabledSelector
  );

  const setRequestInfo = useCallback(
    (reqInfo: RequestInfo) => {
      dispatch(setNativeLoginRequestInfo(reqInfo));
    },
    [dispatch]
  );

  // This is a handler for the browser login. It applies to android only.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextAppState => {
      if (nextAppState === "background") {
        setRequestInfo({
          requestState: "AUTHORIZING",
          nativeAttempts: requestInfo.nativeAttempts
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [requestInfo.nativeAttempts, setRequestInfo]);

  // We call useIOStore beacause we only need some values from store, we don't need any re-render logic
  const store = useIOStore();

  // Memoized values/func --start--
  const state = useMemo(() => store.getState(), [store]);

  const isFastLogin = useMemo(() => isFastLoginEnabledSelector(state), [state]);

  const selectedIdp = useMemo(
    () => selectedIdentityProviderSelector(state),
    [state]
  );

  const idp = useMemo(
    () => selectedIdp?.id as keyof IdpData | undefined,
    [selectedIdp?.id]
  );

  const selectedIdpTextData = useMemo(
    () => idpContextualHelpDataFromIdSelector(idp)(state),
    [idp, state]
  );

  const assistanceToolConfig = useMemo(
    () => assistanceToolConfigSelector(state),
    [state]
  );

  const choosenTool = useMemo(
    () => assistanceToolRemoteConfig(assistanceToolConfig),
    [assistanceToolConfig]
  );

  const remoteApiLoginUrlPrefix = useIOSelector(
    remoteApiLoginUrlPrefixSelector
  );

  const loginUri = useMemo(
    () => (idp ? getIdpLoginUri(idp, 2, remoteApiLoginUrlPrefix) : undefined),
    [idp, remoteApiLoginUrlPrefix]
  );

  const ephemeralKeyTag = useMemo(
    () => ephemeralKeyTagSelector(state),
    [state]
  );

  const contextualHelp = useMemo(() => {
    if (O.isNone(selectedIdpTextData)) {
      return {
        title: I18n.t("authentication.idp_login.contextualHelpTitle"),
        body: I18n.t("authentication.idp_login.contextualHelpContent")
      };
    }
    return emptyContextualHelp;
  }, [selectedIdpTextData]);

  const handleLoginFailure = useCallback(
    (code?: string, message?: string) => {
      dispatch(
        loginFailure({
          error: new Error(
            `login failure with code ${code || message || "n/a"}`
          ),
          idp
        })
      );
      const logText = pipe(
        O.fromNullable(code || message),
        O.fold(
          () => "login failed with no error code or message available",
          _ => {
            if (code) {
              return `login failed with code (${code}) : ${getSpidErrorCodeDescription(
                code
              )}`;
            }
            return `login failed with message ${message}`;
          }
        )
      );

      handleSendAssistanceLog(choosenTool, logText);
      setRequestInfo({
        requestState: "ERROR",
        errorType: ErrorType.LOGIN_ERROR,
        errorCodeOrMessage: code || message,
        nativeAttempts: requestInfo.nativeAttempts
      });
    },
    [choosenTool, dispatch, idp, requestInfo.nativeAttempts, setRequestInfo]
  );

  const handleLoginSuccess = useCallback(
    (token: SessionToken) => {
      setRequestInfo({
        requestState: "AUTHORIZED",
        nativeAttempts: requestInfo.nativeAttempts
      });
      handleSendAssistanceLog(choosenTool, `login success`);
      return idp
        ? dispatch(loginSuccess({ token, idp }))
        : handleLoginFailure("n/a");
    },
    [
      choosenTool,
      dispatch,
      handleLoginFailure,
      idp,
      requestInfo.nativeAttempts,
      setRequestInfo
    ]
  );
  // This function is executed when the native component resolve with an error or when loginUri is undefined.
  // About the first case, unless there is a problem with the phone crashing for other reasons, this is very unlikely to happen.
  const handleLoadingError = useCallback(
    (error?: LoginUtilsError) => {
      void mixpanelTrack("SPID_ERROR", {
        idp,
        description: error?.userInfo?.error,
        errorType: ErrorType.LOADING_ERROR
      });

      const backPressed: LoginUtilsErrorType = "NativeAuthSessionClosed";
      if (error?.userInfo?.error === backPressed) {
        onBack();
        return;
      }

      // If native login component fails 3 times, it returns to idp selection screen and tries to login with WebView.
      if (requestInfo.nativeAttempts > 1) {
        dispatch(disableNativeAuthentication());
        onBack();
        return;
      }

      setRequestInfo({
        requestState: "ERROR",
        errorType: ErrorType.LOADING_ERROR,
        nativeAttempts: requestInfo.nativeAttempts
      });
    },
    [dispatch, idp, requestInfo.nativeAttempts, setRequestInfo]
  );

  // Memoized values/func --end--

  if (loginUri && requestInfo.requestState === "LOADING") {
    void pipe(
      () =>
        regenerateKeyGetRedirectsAndVerifySaml(
          loginUri,
          ephemeralKeyTag,
          mixpanelEnabled,
          isActiveSessionLogin ? isActiveSessionFastLogin : isFastLogin,
          dispatch
        ),
      TE.fold(
        () =>
          T.of(
            setRequestInfo({
              requestState: "ERROR",
              errorType: ErrorType.LOGIN_ERROR,
              nativeAttempts: requestInfo.nativeAttempts
            })
          ),
        url =>
          pipe(
            url,
            () => idpAuthSession(url),
            TE.fold(
              error => T.of(handleLoadingError(error)),
              response =>
                T.of(
                  pipe(
                    extractLoginResult(response),
                    O.fromNullable,
                    O.fold(
                      () => handleLoginFailure(),
                      result =>
                        pipe(
                          result,
                          getEitherLoginResult,
                          E.fold(
                            e =>
                              handleLoginFailure(e.errorCode, e.errorMessage),
                            success => handleLoginSuccess(success.token)
                          )
                        )
                    )
                  )
                )
            )
          )
      )
    )();
  } else if (!loginUri) {
    handleLoadingError();
  }

  useHardwareBackButton(() => {
    if (isBackButtonEnabled(requestInfo)) {
      return true;
    }
    return false;
  });

  const navigation = useIONavigation();

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        gestureEnabled: isBackButtonEnabled(requestInfo)
      });
    }, [navigation, requestInfo])
  );
  useHeaderSecondLevel({
    title: `${I18n.t("authentication.idp_login.headerTitle")} - ${
      selectedIdp?.name
    }`,
    supportRequest: true,
    contextualHelp,
    faqCategories: ["authentication_SPID"],
    canGoBack: isBackButtonEnabled(requestInfo)
  });

  if (requestInfo.requestState === "ERROR") {
    navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
      params: {
        errorCodeOrMessage: requestInfo.errorCodeOrMessage,
        authMethod: "SPID",
        authLevel: "L2",
        isNativeLogin: true
      }
    });
  }
  if (requestInfo.requestState === "AUTHORIZED") {
    return <IdpSuccessfulAuthentication />;
  } else {
    return (
      <LoadingSpinnerOverlay isLoading={requestInfo.requestState === "LOADING"}>
        {requestInfo.requestState === "AUTHORIZING" && (
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.errorContainer}>
              <Pictogram name="timing" size={120} />
              <VSpacer size={16} />
              <H6 style={styles.title}>{I18n.t("spid.pending_login.title")}</H6>
              <VSpacer size={16} />
              <Body>{I18n.t("spid.pending_login.details")}</Body>
            </View>
            <View style={styles.buttonContainer}>
              <IOButton
                fullWidth
                variant="solid"
                label={I18n.t("spid.pending_login.button")}
                accessibilityLabel={I18n.t("spid.pending_login.button")}
                onPress={onBack}
              />
            </View>
          </SafeAreaView>
        )}
      </LoadingSpinnerOverlay>
    );
  }
};
