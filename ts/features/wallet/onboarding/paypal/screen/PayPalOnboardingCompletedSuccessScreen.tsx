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
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { GlobalState } from "../../../../../store/reducers/types";
import I18n from "../../../../../i18n";
import { FooterStackButton } from "../../../../bonus/bonusVacanze/components/buttons/FooterStackButtons";
type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * this screen shows that the onboarding is completed successfully
 * footer button can dismiss the screen or navigate to the PayPal method details
 * @param props
 * @constructor
 */
const PayPalOnboardingCompletedSuccessScreen = (props: Props) => (
  <BaseScreenComponent
    goBack={false}
    customGoBack={<View />}
    showInstabugChat={false}
  >
    <SafeAreaView
      style={IOStyles.flex}
      testID={"PayPalOnboardingCompletedSuccessScreen"}
    >
      <InfoScreenComponent
        image={renderInfoRasterImage(successImage)}
        title={I18n.t("wallet.onboarding.paypal.onBoardingCompleted.title")}
        body={I18n.t("wallet.onboarding.paypal.onBoardingCompleted.body")}
      />
      <FooterStackButton
        buttons={[
          confirmButtonProps(
            props.methodDetails,
            I18n.t(
              "wallet.onboarding.paypal.onBoardingCompleted.primaryButton"
            ),
            undefined,
            "primaryButtonId"
          ),
          cancelButtonProps(
            props.onClose,
            I18n.t(
              "wallet.onboarding.paypal.onBoardingCompleted.secondaryButton"
            ),
            undefined,
            "secondaryButtonId"
          )
        ]}
      />
    </SafeAreaView>
  </BaseScreenComponent>
);

const mapDispatchToProps = (_: Dispatch) => ({
  // TODO replace with the effective handler
  onClose: constNull,
  methodDetails: constNull
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PayPalOnboardingCompletedSuccessScreen);
