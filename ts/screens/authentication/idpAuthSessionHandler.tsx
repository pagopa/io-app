/* eslint-disable import/order */
import { pipe } from "fp-ts/lib/function";
import I18n from "i18n-js";
import * as React from "react";
import {
  LoginUtilsError,
  openAuthenticationSession,
  Error as LoginUtilsErrorType
} from "@pagopa/io-react-native-login-utils";
import * as O from "fp-ts/lib/Option";
import * as T from "fp-ts/lib/Task";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import {
  CommonActions,
  useFocusEffect,
  useNavigation
} from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppState, SafeAreaView, View, StyleSheet } from "react-native";
import { Text } from "native-base";
import { H3 } from "../../components/core/typography/H3";
import BaseScreenComponent, {
  ContextualHelpProps
} from "../../components/screens/BaseScreenComponent";
import { mixpanelTrack } from "../../mixpanel";

import {
  extractLoginResult,
  getEitherLoginResult,
  getIdpLoginUri
} from "../../utils/login";
import { idpContextualHelpDataFromIdSelector } from "../../store/reducers/content";
import Markdown from "../../components/ui/Markdown";
import IdpCustomContextualHelpContent from "../../components/screens/IdpCustomContextualHelpContent";
import NavigationService from "../../navigation/NavigationService";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import { trackLollipopIdpLoginFailure } from "../../utils/analytics";
import { lollipopKeyTagSelector } from "../../features/lollipop/store/reducers/lollipop";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import { regenerateKeyGetRedirectsAndVerifySaml } from "../../features/lollipop/utils/login";
import { useHardwareBackButton } from "../../hooks/useHardwareBackButton";
import { assistanceToolConfigSelector } from "../../store/reducers/backendStatus";
import {
  assistanceToolRemoteConfig,
  handleSendAssistanceLog
} from "../../utils/supportAssistance";
import {
  disableNativeAuthentication,
  loginFailure,
  loginSuccess
} from "../../store/actions/authentication";
import { getSpidErrorCodeDescription } from "../../utils/spidErrorCode";
import { SessionToken } from "../../types/SessionToken";
import { IdpSuccessfulAuthentication } from "../../components/IdpSuccessfulAuthentication";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import { Pictogram } from "../../components/core/pictograms";
import { VSpacer } from "../../components/core/spacer/Spacer";
import { IOStyles } from "../../components/core/variables/IOStyles";
import themeVariables from "../../theme/variables";
import { isMixpanelEnabled } from "../../store/reducers/persistedPreferences";
import {
  ErrorType,
  IdpAuthErrorScreen,
  IdpAuthErrorScreenType
} from "./idpAuthErrorScreen";
import { useStore } from "react-redux";
import { selectedIdentityProviderSelector } from "../../store/reducers/authentication";
import { IdpData } from "../../../definitions/content/IdpData";
import { isFastLoginEnabledSelector } from "../../features/fastLogin/store/selectors";

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

export type AuthSessionErrorPageType = {
  contextualHelp: ContextualHelpProps;
  idpName: string;
  idpAuthErrorScreenProps: IdpAuthErrorScreenType;
};

type RequestInfoPositiveStates = {
  requestState: "LOADING" | "AUTHORIZED" | "AUTHORIZING";
  nativeAttempts: number;
};

type RequestInfoError = {
  requestState: "ERROR";
  errorType: ErrorType;
  errorCode?: string;
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

export const AuthSessionPage = () => {
  const [requestInfo, setRequestInfo] = useState<RequestInfo>({
    requestState: "LOADING",
    nativeAttempts: 0
  });

  const mixpanelEnabled = useIOSelector(isMixpanelEnabled);

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
  }, [requestInfo.nativeAttempts]);

  const dispatch = useIODispatch();

  // We call useStore beacause we only need some values from store, we don't need any re-render logic
  const store = useStore();

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

  const loginUri = useMemo(
    () => (idp ? getIdpLoginUri(idp, 2) : undefined),
    [idp]
  );

  const maybeKeyTag = useMemo(() => lollipopKeyTagSelector(state), [state]);

  const contextualHelp = useMemo(
    () =>
      pipe(
        selectedIdpTextData,
        O.fold(
          () => ({
            title: I18n.t("authentication.idp_login.contextualHelpTitle"),
            body: () => (
              <Markdown>
                {I18n.t("authentication.idp_login.contextualHelpContent")}
              </Markdown>
            )
          }),
          idpTextData => IdpCustomContextualHelpContent(idpTextData)
        )
      ),
    [selectedIdpTextData]
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
        errorCode: code,
        nativeAttempts: requestInfo.nativeAttempts
      });
    },
    [choosenTool, dispatch, idp, requestInfo.nativeAttempts]
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
    [choosenTool, dispatch, handleLoginFailure, idp, requestInfo.nativeAttempts]
  );
  // This function is executed when the native component resolve with an error or when loginUri is undefined.
  // About the first case, unless there is a problem with the phone crashing for other reasons, this is very unlikely to happen.
  const handleLoadingError = useCallback(
    (error?: LoginUtilsError) => {
      void mixpanelTrack("SPID_ERROR", {
        idp,
        description: error?.userInfo.Error,
        errorType: ErrorType.LOADING_ERROR
      });

      const backPressed: LoginUtilsErrorType = "NativeAuthSessionClosed";
      if (error?.userInfo.Error === backPressed) {
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
    [dispatch, idp, requestInfo.nativeAttempts]
  );

  // Memoized values/func --end--

  if (
    loginUri &&
    O.isSome(maybeKeyTag) &&
    requestInfo.requestState === "LOADING"
  ) {
    void pipe(
      () =>
        regenerateKeyGetRedirectsAndVerifySaml(
          loginUri,
          maybeKeyTag.value,
          mixpanelEnabled,
          isFastLogin,
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
                            e => handleLoginFailure(e.errorCode),
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
  } else if (O.isNone(maybeKeyTag)) {
    setRequestInfo({
      requestState: "ERROR",
      errorType: ErrorType.LOGIN_ERROR, // VA AGGIUNTO UN CODICE DI ERRORE (anche dev server)??
      nativeAttempts: requestInfo.nativeAttempts
    });
    trackLollipopIdpLoginFailure(
      "Missing keyTag while trying to login with lollipop"
    );
  }

  useHardwareBackButton(() => {
    if (isBackButtonEnabled(requestInfo)) {
      return true;
    }
    return false;
  });

  const navigation = useNavigation();
  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        gestureEnabled: isBackButtonEnabled(requestInfo)
      });
    }, [navigation, requestInfo])
  );

  // It is enough to set the status to loading,
  // the reload will ensure that the functions necessary for correct functioning are performed.
  const onRetry = () =>
    setRequestInfo({
      requestState: "LOADING",
      nativeAttempts: requestInfo.nativeAttempts + 1
    });

  if (requestInfo.requestState === "AUTHORIZED") {
    return <IdpSuccessfulAuthentication />;
  } else {
    return (
      <BaseScreenComponent
        goBack={isBackButtonEnabled(requestInfo)}
        hideHelpButton={!isBackButtonEnabled(requestInfo)}
        contextualHelp={contextualHelp}
        faqCategories={["authentication_SPID"]}
        headerTitle={`${I18n.t("authentication.idp_login.headerTitle")} - ${
          selectedIdp?.name
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
          {requestInfo.requestState === "AUTHORIZING" && (
            <SafeAreaView style={IOStyles.flex}>
              <View style={styles.errorContainer}>
                <Pictogram name={"processing"} size={120} />
                <VSpacer size={16} />
                <H3 style={styles.title}>
                  {I18n.t("spid.pending_login.title")}
                </H3>
                <VSpacer size={16} />
                <Text>{I18n.t("spid.pending_login.details")}</Text>
              </View>
              <View style={styles.buttonContainer}>
                <ButtonDefaultOpacity block={true} onPress={onBack}>
                  <Text>{I18n.t("spid.pending_login.button")}</Text>
                </ButtonDefaultOpacity>
              </View>
            </SafeAreaView>
          )}
        </LoadingSpinnerOverlay>
      </BaseScreenComponent>
    );
  }
};
