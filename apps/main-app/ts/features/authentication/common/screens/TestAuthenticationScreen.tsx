import {
  Alert,
  Body,
  LoadingSpinner,
  TextInputPassword,
  TextInputValidation,
  VSpacer
} from "@io-app/design-system";
import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import { useFocusEffect } from "@react-navigation/native";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import I18n from "i18next";
import { useCallback, useState } from "react";
import { View } from "react-native";

import { PasswordLogin } from "../../../../../definitions/session_manager/PasswordLogin";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isMixpanelEnabled } from "../../../../store/reducers/persistedPreferences";
import { getAppVersion } from "../../../../utils/appVersion";
import { handleRegenerateEphemeralKey } from "../../../lollipop";
import { ephemeralKeyTagSelector } from "../../../lollipop/store/reducers/lollipop";
import { testLoginCleanUp, testLoginRequest } from "../../common/store/actions";
import { testLoginSelector } from "../store/reducers/testLogin";

const checkUsernameValid = (username: string): boolean =>
  E.isRight(FiscalCode.decode(username));

const VersionView = () => (
  <View
    style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}
    testID="appVersionView"
  >
    <Body>{I18n.t("profile.main.appVersion")}</Body>
    <Body numberOfLines={1} testID="appVersion" weight="Semibold">
      {getAppVersion()}
    </Body>
  </View>
);

const LoadingView = () => (
  <View style={{ flex: 1 }}>
    <VSpacer size={40} />
    <LoadingSpinner
      accessibilityHint={I18n.t("global.accessibility.activityIndicator.hint")}
      accessibilityLabel={I18n.t(
        "global.accessibility.activityIndicator.label"
      )}
      size={48}
      testID={"activityIndicator"}
    />
    <VSpacer size={40} />
  </View>
);

const ErrorView = (content: string) => (
  <View style={{ flex: 1 }} testID="errorView">
    <VSpacer size={16} />
    <Alert content={content} variant="error" />
    <VSpacer size={16} />
  </View>
);

const SuccessfulView = () => (
  <View style={{ flex: 1 }} testID="successView">
    <VSpacer size={16} />
    <Alert content={"Success"} variant="success" />
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
  const ephemeralKeyTag = useIOSelector(ephemeralKeyTagSelector);
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
        O.some(ephemeralKeyTag),
        O.map((keyTag: string) =>
          TE.tryCatch(
            () =>
              handleRegenerateEphemeralKey(keyTag, mixpanelEnabled, dispatch),
            E.toError
          )
        ),
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
    [
      ephemeralKeyTag,
      mixpanelEnabled,
      requestLogin,
      dispatch,
      username,
      password
    ]
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
          onPress: () => void handlePressLoginButton(),
          testID: "confirmButton"
        }
      }}
    >
      <TextInputValidation
        disabled={isLoading}
        errorMessage={`${I18n.t("global.username")} is invalid`}
        icon="profile"
        onChangeText={setUsername}
        onValidate={isUsernameFieldValid}
        placeholder={I18n.t("global.username")}
        testID={"usernameInput"}
        textInputProps={{
          inputMode: "text",
          returnKeyType: "done"
        }}
        value={username}
      />
      <VSpacer size={16} />
      <TextInputPassword
        buttonAccessibilityLabel={I18n.t(
          "global.accessibility.togglePasswordVisibility"
        )}
        disabled={isLoading}
        icon="locked"
        onChangeText={setPassword}
        placeholder={I18n.t("global.password")}
        testID={"passwordInput"}
        textInputProps={{
          returnKeyType: "done"
        }}
        value={password}
      />
      <VSpacer size={16} />
      <VersionView />
      {isLoading && <LoadingView />}
      {isError && ErrorView(loginState.errorMessage)}
      {isSuccessful && SuccessfulView()}
    </IOScrollView>
  );
};

export default TestAuthenticationScreen;
