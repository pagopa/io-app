import {
  Alert,
  Body,
  IOColors,
  TextInputPassword,
  TextInputValidation,
  VSpacer
} from "@pagopa/io-app-design-system";
import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import { useFocusEffect } from "@react-navigation/native";
import * as E from "fp-ts/lib/Either";
import * as T from "fp-ts/lib/Task";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { PasswordLogin } from "../../../definitions/session_manager/PasswordLogin";
import { IOStyles } from "../../components/core/variables/IOStyles";
import ActivityIndicator from "../../components/ui/ActivityIndicator";
import I18n from "../../i18n";
import {
  testLoginCleanUp,
  testLoginRequest
} from "../../store/actions/authentication";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import { testLoginSelector } from "../../store/reducers/testLogin";
import { getAppVersion } from "../../utils/appVersion";
import { handleRegenerateKey } from "../../features/lollipop";
import { lollipopKeyTagSelector } from "../../features/lollipop/store/reducers/lollipop";
import { isMixpanelEnabled } from "../../store/reducers/persistedPreferences";
import { useHeaderSecondLevel } from "../../hooks/useHeaderSecondLevel";
import { IOScrollView } from "../../components/ui/IOScrollView";

const styles = StyleSheet.create({
  appVersion: { ...IOStyles.flex, ...IOStyles.rowSpaceBetween }
});

const checkUsernameValid = (username: string): boolean =>
  E.isRight(FiscalCode.decode(username));

const VersionView = () => (
  <View style={styles.appVersion} testID="appVersionView">
    <Body>{I18n.t("profile.main.appVersion")}</Body>
    <Body numberOfLines={1} weight="Semibold" testID="appVersion">
      {getAppVersion()}
    </Body>
  </View>
);

const LoadingView = () => (
  <View style={IOStyles.flex}>
    <VSpacer size={40} />
    <ActivityIndicator
      animating={true}
      size={"large"}
      color={IOColors.blue}
      accessible={true}
      accessibilityHint={I18n.t("global.accessibility.activityIndicator.hint")}
      accessibilityLabel={I18n.t(
        "global.accessibility.activityIndicator.label"
      )}
      importantForAccessibility={"no-hide-descendants"}
      testID={"activityIndicator"}
    />
    <VSpacer size={40} />
  </View>
);

const ErrorView = (title: string, content: string) => (
  <View style={IOStyles.flex} testID="errorView">
    <VSpacer size={16} />
    <Alert variant="error" title={title} content={content} />
    <VSpacer size={16} />
  </View>
);

const SuccessfulView = () => (
  <View style={IOStyles.flex} testID="successView">
    <VSpacer size={16} />
    <Alert variant="success" content={"Success"} />
    <VSpacer size={16} />
  </View>
);

const isConfirmButtonDisabled = (
  username: string,
  password: string,
  isLoading: boolean
) => password.length === 0 || !checkUsernameValid(username) || isLoading;

const isUsernameFieldValid = (username: string) =>
  username.length > 0 ? checkUsernameValid(username) : false;

const TestAuthenticationScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const loginState = useIOSelector(testLoginSelector);
  const dispatch = useIODispatch();
  const isLoading = loginState.kind === "requested";
  const isError = loginState.kind === "failed";
  const isSuccessful = loginState.kind === "succedeed";
  const maybeKeyTag = useIOSelector(lollipopKeyTagSelector);
  const mixpanelEnabled = useIOSelector(isMixpanelEnabled);

  const requestLogin = useCallback(
    (passwordLogin: PasswordLogin) => dispatch(testLoginRequest(passwordLogin)),
    [dispatch]
  );
  const cleanUpLogin = useCallback(
    () => dispatch(testLoginCleanUp()),
    [dispatch]
  );

  useFocusEffect(useCallback(() => cleanUpLogin, [cleanUpLogin]));

  const handlePressLoginButton = useCallback(
    () =>
      pipe(
        // First, map over maybeKeyTag to get the TaskEither if it's Some
        O.map((keyTag: string) =>
          TE.tryCatch(
            () => handleRegenerateKey(keyTag, mixpanelEnabled, dispatch),
            E.toError
          )
        )(maybeKeyTag),
        // If maybeKeyTag is None, create a TaskEither that immediately fails
        O.getOrElse(() => TE.left(new Error("Missing keyTag"))),
        // Continue with the login flow if key regeneration is successful
        TE.chainW(() =>
          pipe(
            PasswordLogin.decode({ username, password }),
            TE.fromEither,
            TE.map(requestLogin)
          )
        ),
        TE.fold(
          error => {
            // eslint-disable-next-line no-console
            console.error(error);
            return T.of(undefined);
          },
          result => T.of(result)
        )
      )(),
    [maybeKeyTag, mixpanelEnabled, requestLogin, dispatch, username, password]
  );

  useHeaderSecondLevel({
    title: "Test login"
  });

  return (
    <IOScrollView
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t("global.buttons.confirm"),
          accessibilityLabel: I18n.t("global.buttons.confirm"),
          disabled: isConfirmButtonDisabled(username, password, isLoading),
          onPress: handlePressLoginButton,
          testID: "confirmButton"
        }
      }}
    >
      <TextInputValidation
        placeholder={I18n.t("global.username")}
        value={username}
        onChangeText={setUsername}
        testID={"usernameInput"}
        icon="profile"
        onValidate={isUsernameFieldValid}
        errorMessage={`${I18n.t("global.username")} is invalid`}
        disabled={isLoading}
        textInputProps={{
          inputMode: "text",
          returnKeyType: "done"
        }}
      />
      <VSpacer size={16} />
      <TextInputPassword
        placeholder={I18n.t("global.password")}
        value={password}
        onChangeText={setPassword}
        testID={"passwordInput"}
        icon="locked"
        disabled={isLoading}
        textInputProps={{
          returnKeyType: "done"
        }}
      />
      <VSpacer size={16} />
      <VersionView />
      {isLoading && <LoadingView />}
      {isError && ErrorView("Error", loginState.errorMessage)}
      {isSuccessful && SuccessfulView()}
    </IOScrollView>
  );
};

export default TestAuthenticationScreen;
