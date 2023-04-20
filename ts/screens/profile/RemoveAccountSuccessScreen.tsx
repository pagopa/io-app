import { Content } from "native-base";
import * as React from "react";
import { Image, SafeAreaView, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { IOStyles } from "../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import I18n from "../../i18n";
import { H4 } from "../../components/core/typography/H4";
import { H2 } from "../../components/core/typography/H2";
import {
  AppParamsList,
  IOStackNavigationRouteProps
} from "../../navigation/params/AppParamsList";
import { Dispatch } from "../../store/actions/types";
import { logoutRequest } from "../../store/actions/authentication";
import expiredIcon from "../../../img/wallet/errors/payment-expired-icon.png";
import { useHardwareBackButton } from "../../hooks/useHardwareBackButton";
import { VSpacer } from "../../components/core/spacer/Spacer";

type Props = IOStackNavigationRouteProps<AppParamsList> &
  ReturnType<typeof mapDispatchToProps>;
const styles = StyleSheet.create({
  content: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  }
});
/**
 * A screen to explain how the account removal works.
 * Here user can ask to delete his account
 */
const RemoveAccountSuccess: React.FunctionComponent<Props> = props => {
  // do nothing
  useHardwareBackButton(() => true);

  const continueButtonProps = {
    block: true,
    bordered: true,
    primary: true,
    onPress: props.logout,
    title: I18n.t("profile.main.privacy.removeAccount.success.cta")
  };

  const footerComponent = (
    <FooterWithButtons type={"SingleButton"} leftButton={continueButtonProps} />
  );

  return (
    <BaseScreenComponent headerTitle={I18n.t("profile.main.title")}>
      <SafeAreaView style={IOStyles.flex}>
        <Content contentContainerStyle={styles.content}>
          <Image source={expiredIcon} />
          <VSpacer size={16} />
          <H2>{I18n.t("profile.main.privacy.removeAccount.success.title")}</H2>
          <H4 weight="Regular" style={{ textAlign: "center" }}>
            {I18n.t("profile.main.privacy.removeAccount.success.body")}
          </H4>
        </Content>
        {footerComponent}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  // hard-logout
  logout: () => dispatch(logoutRequest())
});

export default connect(undefined, mapDispatchToProps)(RemoveAccountSuccess);
