import React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { View } from "native-base";
import { SafeAreaView } from "react-native";
import { constNull } from "fp-ts/lib/function";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { InfoScreenComponent } from "../../../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../../../components/infoScreen/imageRendering";
import successImage from "../../../../../../img/pictograms/payment-completed.png";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { cancelButtonProps } from "../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { GlobalState } from "../../../../../store/reducers/types";
import I18n from "../../../../../i18n";
type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const PayPalOnboardingCompletedSuccessScreen = (props: Props) => (
  <BaseScreenComponent
    goBack={false}
    customGoBack={<View />}
    showInstabugChat={false}
  >
    <SafeAreaView style={IOStyles.flex} testID={"OutcomeCode"}>
      <InfoScreenComponent
        image={renderInfoRasterImage(successImage)}
        title={I18n.t("wallet.onboarding.paypal.onBoardingCompleted.title")}
        body={I18n.t("wallet.onboarding.paypal.onBoardingCompleted.body")}
      />
      <FooterWithButtons
        type={"TwoButtonsInlineThird"}
        rightButton={{
          testID: "continueButtonId",
          bordered: false,
          // TODO replace with the effective handler
          onPress: undefined,
          title: I18n.t(
            "wallet.onboarding.paypal.onBoardingCompleted.primaryButton"
          )
        }}
        leftButton={cancelButtonProps(
          props.onClose,
          I18n.t("wallet.onboarding.paypal.onBoardingCompleted.secondaryButton")
        )}
      />
    </SafeAreaView>
  </BaseScreenComponent>
);

const mapDispatchToProps = (_: Dispatch) => ({
  onClose: constNull
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PayPalOnboardingCompletedSuccessScreen);
