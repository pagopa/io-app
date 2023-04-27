import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { connect } from "react-redux";
import { NavigationEvents } from "@react-navigation/compat";
import { PasswordLogin } from "../../../definitions/backend/PasswordLogin";
import { VSpacer } from "../../components/core/spacer/Spacer";
import { LabelledItem } from "../../components/LabelledItem";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { BlockButtonProps } from "../../components/ui/BlockButtons";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import I18n from "../../i18n";
import { Dispatch } from "../../store/actions/types";
import { ContentWrapper } from "../../components/core/ContentWrapper";
import { Body } from "../../components/core/typography/Body";
import { getAppVersion } from "../../utils/appVersion";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { useIOSelector } from "../../store/hooks";
import { testLoginSelector } from "../../store/reducers/testLogin";
import ActivityIndicator from "../../components/ui/ActivityIndicator";
import { IOColors } from "../../components/core/variables/IOColors";
import { Alert } from "../../components/Alert";
import {
  testLoginCleanUp,
  testLoginRequest
} from "../../store/actions/authentication";

const styles = StyleSheet.create({
  appVersion: { ...IOStyles.flex, ...IOStyles.rowSpaceBetween }
});

type Props = ReturnType<typeof mapDispatchToProps>;

const checkUsernameValid = (username: string): boolean =>
  E.isRight(FiscalCode.decode(username));

const VersionView = () => (
  <View style={styles.appVersion} testID="appVersionView">
    <Body>{I18n.t("profile.main.appVersion")}</Body>
    <Body numberOfLines={1} weight="SemiBold" testID="appVersion">
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

const ErrorView = (title: string, content: string) => {
  const viewRef = React.createRef<View>();
  return (
    <View style={IOStyles.flex} testID="errorView">
      <VSpacer size={16} />
      <Alert
        viewRef={viewRef}
        variant="error"
        title={title}
        content={content}
      />
      <VSpacer size={16} />
    </View>
  );
};

const SuccessfulView = () => {
  const viewRef = React.createRef<View>();
  return (
    <View style={IOStyles.flex} testID="successView">
      <VSpacer size={16} />
      <Alert viewRef={viewRef} variant="success" content={"Success"} />
      <VSpacer size={16} />
    </View>
  );
};

const isConfirmButtonDisabled = (
  username: string,
  password: string,
  isLoading: boolean
) => password.length === 0 || !checkUsernameValid(username) || isLoading;

const isUsernameFieldValid = (username: string) =>
  username.length > 0 ? checkUsernameValid(username) : undefined;

const isPasswordFieldValid = (password: string) =>
  password.length > 0 ? true : undefined;

const TestAuthenticationScreen = (props: Props) => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const loginState = useIOSelector(testLoginSelector);
  const isLoading = loginState.kind === "requested";
  const isError = loginState.kind === "failed";
  const isSuccessful = loginState.kind === "succedeed";

  const confirmButton: BlockButtonProps = {
    block: true,
    primary: true,
    disabled: isConfirmButtonDisabled(username, password, isLoading),
    onPress: () =>
      pipe(
        PasswordLogin.decode({ username, password }),
        E.map(props.requestLogin)
      ),
    title: I18n.t("global.buttons.confirm"),
    testID: "confirmButton"
  };

  return (
    <BaseScreenComponent goBack={true} headerTitle={"Test login"}>
      <NavigationEvents onWillBlur={props.cleanUpLogin} />
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView>
          <ContentWrapper>
            <LabelledItem
              label={I18n.t("global.username")}
              icon="io-titolare"
              isValid={isUsernameFieldValid(username)}
              inputProps={{
                disabled: isLoading,
                value: username,
                placeholder: I18n.t("global.username"),
                returnKeyType: "done",
                onChangeText: setUsername
              }}
              testID={"username"}
            />
            <VSpacer size={16} />
            <LabelledItem
              label={I18n.t("global.password")}
              icon="io-lucchetto"
              isValid={isPasswordFieldValid(password)}
              inputProps={{
                disabled: isLoading,
                value: password,
                placeholder: I18n.t("global.password"),
                returnKeyType: "done",
                secureTextEntry: true,
                onChangeText: setPassword
              }}
              testID={"password"}
            />
            <VSpacer size={16} />
            <VersionView />
            {isLoading && <LoadingView />}
            {isError && ErrorView("Error", loginState.errorMessage)}
            {isSuccessful && SuccessfulView()}
          </ContentWrapper>
        </ScrollView>
        <FooterWithButtons type={"SingleButton"} leftButton={confirmButton} />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  requestLogin: (passwordLogin: PasswordLogin) =>
    dispatch(testLoginRequest(passwordLogin)),
  cleanUpLogin: () => dispatch(testLoginCleanUp())
});

export default connect(undefined, mapDispatchToProps)(TestAuthenticationScreen);
