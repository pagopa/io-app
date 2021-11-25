import React from "react";
import { InfoScreenComponent } from "../../../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../../../components/infoScreen/imageRendering";
import successImage from "../../../../../../img/pictograms/payment-completed.png";
import { confirmButtonProps } from "../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import I18n from "../../../../../i18n";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { walletAddPaypalCompleted } from "../store/actions";
import { useIODispatch } from "../../../../../store/hooks";

/**
 * this screen shows that the onboarding is completed successfully
 * footer button navigates to the PayPal method details
 * @constructor
 */
const PayPalOnboardingCompletedSuccessComponent = () => {
  const dispatch = useIODispatch();
  return (
    <>
      <InfoScreenComponent
        image={renderInfoRasterImage(successImage)}
        title={I18n.t("wallet.onboarding.paypal.onBoardingCompleted.title")}
        body={I18n.t("wallet.onboarding.paypal.onBoardingCompleted.body")}
      />
      <FooterWithButtons
        type={"SingleButton"}
        leftButton={confirmButtonProps(
          () => dispatch(walletAddPaypalCompleted()),
          I18n.t("wallet.onboarding.paypal.onBoardingCompleted.primaryButton"),
          undefined,
          "primaryButtonId"
        )}
      />
    </>
  );
};

export default PayPalOnboardingCompletedSuccessComponent;
