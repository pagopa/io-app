import { FiscalCode } from "italia-ts-commons/lib/strings";
import { Content, View } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { PasswordLogin } from "../../../definitions/backend/PasswordLogin";
import { LabelledItem } from "../../components/LabelledItem";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { BlockButtonProps } from "../../components/ui/BlockButtons";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import I18n from "../../i18n";
import { testLoginRequest } from "../../store/actions/authentication";
import { Dispatch } from "../../store/actions/types";

type Props = ReturnType<typeof mapDispatchToProps>;

const checkUsernameValid = (username: string): boolean =>
  FiscalCode.decode(username).isRight();

const TestAuthenticationScreen: React.FunctionComponent<Props> = (
  props: Props
) => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const confirmButton: BlockButtonProps = {
    block: true,
    primary: true,
    disabled: password.length === 0 || !checkUsernameValid(username),
    onPress: () =>
      PasswordLogin.decode({ username, password }).map(props.requestLogin),
    title: I18n.t("global.buttons.confirm")
  };

  return (
    <BaseScreenComponent goBack={true} headerTitle={"Test login"}>
      <SafeAreaView style={{ flex: 1 }}>
        <Content>
          <LabelledItem
            label={I18n.t("global.username")}
            icon="io-titolare"
            isValid={
              username.length > 0 ? checkUsernameValid(username) : undefined
            }
            inputProps={{
              value: username,
              placeholder: I18n.t("global.username"),
              returnKeyType: "done",
              onChangeText: setUsername
            }}
          />

          <View spacer={true} />

          <LabelledItem
            label={I18n.t("global.password")}
            icon="io-lucchetto"
            isValid={password.length > 0 ? true : undefined}
            inputProps={{
              value: password,
              placeholder: I18n.t("global.password"),
              returnKeyType: "done",
              secureTextEntry: true,
              onChangeText: setPassword
            }}
          />
        </Content>
        <FooterWithButtons type={"SingleButton"} leftButton={confirmButton} />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  requestLogin: (passwordLogin: PasswordLogin) =>
    dispatch(testLoginRequest(passwordLogin))
});

export default connect(undefined, mapDispatchToProps)(TestAuthenticationScreen);
