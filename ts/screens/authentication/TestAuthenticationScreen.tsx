import { Content, View } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-navigation";
import { connect } from "react-redux";
import { PasswordLogin } from "../../../definitions/backend/PasswordLogin";
import { LabelledItem } from "../../components/LabelledItem";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import I18n from "../../i18n";
import { testLogin } from "../../store/actions/authentication";
import { Dispatch } from "../../store/actions/types";

type Props = ReturnType<typeof mapDispatchToProps>;

const TestAuthenticationScreen: React.FunctionComponent<Props> = (
  props: Props
) => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const confirmButton = {
    block: true,
    primary: true,
    onPress: () => props.requestLogin({ username, password } as PasswordLogin),
    title: I18n.t("global.buttons.confirm")
  };

  return (
    <BaseScreenComponent goBack={true} headerTitle={"Test login"}>
      <SafeAreaView style={{ flex: 1 }}>
        <Content>
          <LabelledItem
            type={"text"}
            label={I18n.t("wallet.dummyCard.labels.holder")}
            icon="io-titolare"
            inputProps={{
              value: username,
              placeholder: I18n.t("wallet.dummyCard.values.holder"),
              returnKeyType: "done",
              onChangeText: (value: string) => setUsername(value)
            }}
          />

          <View spacer={true} />

          <LabelledItem
            type={"text"}
            label={I18n.t("wallet.dummyCard.labels.holder")}
            icon="io-lucchetto"
            inputProps={{
              value: password,
              placeholder: I18n.t("wallet.dummyCard.values.holder"),
              returnKeyType: "done",
              secureTextEntry: true,
              onChangeText: (value: string) => setPassword(value)
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
    dispatch(testLogin.request(passwordLogin))
});

export default connect(
  undefined,
  mapDispatchToProps
)(TestAuthenticationScreen);
