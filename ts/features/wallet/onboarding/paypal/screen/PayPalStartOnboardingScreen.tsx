import React from "react";
import { Dimensions, SafeAreaView, View } from "react-native";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import I18n from "../../../../../i18n";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { Body } from "../../../../../components/core/typography/Body";
import { InfoScreenComponent } from "../../../../../components/infoScreen/InfoScreenComponent";
import PPLogo from "../../../../../../img/wallet/payment-methods/paypal/paypal_logo.svg";
import Oval from "../../../../../../img/wallet/payment-methods/paypal/oval.svg";
import { GlobalState } from "../../../../../store/reducers/types";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * logo should fill the screen width for 206 at maximum
 * otherwise it will take the 60% of the screen width
 * this is to avoid a too big logo on narrow screens
 */
const ovalWith = Math.min(206, Dimensions.get("window").width * 0.6);
const logoWidth = ovalWith * 0.4;
// an oval background with PP logo on it, at the center
const PayPalLogo = () => (
  <View
    style={{ alignItems: "center", justifyContent: "center" }}
    testID={"payPalLogo"}
  >
    <Oval width={ovalWith} height={ovalWith} />
    <PPLogo
      width={logoWidth}
      height={logoWidth}
      style={{ position: "absolute" }}
    />
  </View>
);

/**
 * This screen is the start point to onboard PayPal as payment method
 * It shows the PP logo and some texts
 * At the bottom 2 CTA to cancel or continue
 */
const PayPalStartOnboardingScreen = (_: Props): React.ReactElement | null => {
  const cancelButtonProps = {
    testID: "cancelButtonId",
    primary: false,
    bordered: true,
    // TODO replace with the effective handler
    onPress: undefined,
    title: I18n.t("global.buttons.cancel")
  };
  const continueButtonProps = {
    testID: "continueButtonId",
    bordered: false,
    // TODO replace with the effective handler
    onPress: undefined,
    title: I18n.t("global.buttons.continue")
  };

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("wallet.onboarding.paypal.headerTitle")}
    >
      <SafeAreaView
        style={IOStyles.flex}
        testID={"PayPalStartOnboardingScreen"}
      >
        <InfoScreenComponent
          image={<PayPalLogo />}
          title={I18n.t("wallet.onboarding.paypal.start.title")}
          body={
            <Body style={{ textAlign: "center" }}>
              {I18n.t("wallet.onboarding.paypal.start.body")}
            </Body>
          }
        />
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={cancelButtonProps}
          rightButton={continueButtonProps}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (_: Dispatch) => ({});
const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PayPalStartOnboardingScreen);
