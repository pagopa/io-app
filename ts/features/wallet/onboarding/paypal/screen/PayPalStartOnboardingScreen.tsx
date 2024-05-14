import { FooterWithButtons } from "@pagopa/io-app-design-system";
import React from "react";
import { Dimensions, SafeAreaView, View } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Oval from "../../../../../../img/wallet/payment-methods/paypal/oval.svg";
import PPLogo from "../../../../../../img/wallet/payment-methods/paypal/paypal_logo.svg";
import SectionStatusComponent from "../../../../../components/SectionStatus";
import { Body } from "../../../../../components/core/typography/Body";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../../../../components/infoScreen/InfoScreenComponent";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../../navigation/routes";
import { GlobalState } from "../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import PAYPAL_ROUTES from "../navigation/routes";
import { walletAddPaypalBack, walletAddPaypalCancel } from "../store/actions";

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
const PayPalStartOnboardingScreen = (
  props: Props
): React.ReactElement | null => {
  const navigationContext = useIONavigation();

  const navigateToSearchPsp = () =>
    navigationContext.navigate(ROUTES.WALLET_NAVIGATOR, {
      screen: PAYPAL_ROUTES.ONBOARDING.MAIN,
      params: {
        screen: PAYPAL_ROUTES.ONBOARDING.SEARCH_PSP
      }
    });

  return (
    <BaseScreenComponent
      goBack={props.goBack}
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
        <SectionStatusComponent sectionKey={"paypal"} />
      </SafeAreaView>
      <FooterWithButtons
        type="TwoButtonsInlineThird"
        primary={{
          type: "Outline",
          buttonProps: {
            label: I18n.t("global.buttons.cancel"),
            accessibilityLabel: I18n.t("global.buttons.cancel"),
            onPress: props.cancel,
            testID: "cancelButtonId"
          }
        }}
        secondary={{
          type: "Solid",
          buttonProps: {
            label: I18n.t("global.buttons.continue"),
            accessibilityLabel: I18n.t("global.buttons.continue"),
            onPress: navigateToSearchPsp,
            testID: "continueButtonId"
          }
        }}
      />
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  goBack: () => dispatch(walletAddPaypalBack()),
  cancel: () => dispatch(walletAddPaypalCancel())
});
const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PayPalStartOnboardingScreen);
