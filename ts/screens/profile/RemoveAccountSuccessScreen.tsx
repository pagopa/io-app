import { Content, View, Text } from "native-base";
import * as React from "react";
import { Image, SafeAreaView, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { NavigationScreenProps } from "react-navigation";
import { IOStyles } from "../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import I18n from "../../i18n";
import { H4 } from "../../components/core/typography/H4";
import ROUTES from "../../navigation/routes";
import { H2 } from "../../components/core/typography/H2";
import { Dispatch } from "../../store/actions/types";
import { logoutRequest } from "../../store/actions/authentication";

type Props = NavigationScreenProps & ReturnType<typeof mapDispatchToProps>;

const styles = StyleSheet.create({
  center: {
    justifyContent: "center",
    alignItems: "center"
  }
});

/**
 * A screen to explain how the account removal works.
 * Here user can ask to delete his account
 */
const RemoveAccountSuccess: React.FunctionComponent<Props> = props => {
  const continueButtonProps = {
    block: true,
    primary: true,
    onPress: props.logout,
    title: I18n.t("profile.main.privacy.removeAccount.info.cta")
  };

  const footerComponent = (
    <FooterWithButtons type={"SingleButton"} leftButton={continueButtonProps} />
  );
  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("profile.main.title")}
    >
      <SafeAreaView style={IOStyles.flex}>
        <Content
          contentContainerStyle={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Image
            source={require("../../../img/wallet/errors/payment-expired-icon.png")}
          />
          <View spacer={true} />
          <H2>{I18n.t("profile.main.privacy.removeAccount.success.title")}</H2>
          <H4 weight="Regular">
            <Text alignCenter={true}>
              {I18n.t("profile.main.privacy.removeAccount.success.body")}
            </Text>
          </H4>
        </Content>
        {footerComponent}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  // hard-logout
  logout: () => dispatch(logoutRequest({ keepUserData: false }))
});

export default connect(undefined, mapDispatchToProps)(RemoveAccountSuccess);
