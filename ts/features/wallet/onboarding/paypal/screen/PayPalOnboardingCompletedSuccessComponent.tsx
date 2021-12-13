import React from "react";
import { InfoScreenComponent } from "../../../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../../../components/infoScreen/imageRendering";
import successImage from "../../../../../../img/pictograms/payment-completed.png";
import { confirmButtonProps } from "../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import I18n from "../../../../../i18n";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { walletAddPaypalCompleted } from "../store/actions";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { isPaymentOngoingSelector } from "../../../../../store/reducers/wallet/payment";

const getLocales = (isPaymentOnGoing: boolean) => {
  if (isPaymentOnGoing) {
    return {
      title: I18n.t(
        "wallet.onboarding.paypal.onBoardingCompletedWhilePayment.title"
      ),
      body: I18n.t(
        "wallet.onboarding.paypal.onBoardingCompletedWhilePayment.body"
      ),
      ctaTitle: I18n.t(
        "wallet.onboarding.paypal.onBoardingCompletedWhilePayment.primaryButton"
      )
    };
  }
  return {
    title: I18n.t("wallet.onboarding.paypal.onBoardingCompleted.title"),
    body: I18n.t("wallet.onboarding.paypal.onBoardingCompleted.body"),
    ctaTitle: I18n.t(
      "wallet.onboarding.paypal.onBoardingCompleted.primaryButton"
    )
  };
};

/**
 * this screen shows that the onboarding is completed successfully
 * footer button navigates to the PayPal method details
 * @constructor
 */
const PayPalOnboardingCompletedSuccessComponent = () => {
  const dispatch = useIODispatch();
  const isPaymentOnGoing = useIOSelector(isPaymentOngoingSelector);
  const locales = getLocales(isPaymentOnGoing);
  return (
    <>
      <InfoScreenComponent
        image={renderInfoRasterImage(successImage)}
        title={locales.title}
        body={locales.body}
      />
      <FooterWithButtons
        type={"SingleButton"}
        leftButton={confirmButtonProps(
          () => dispatch(walletAddPaypalCompleted()),
          locales.ctaTitle,
          undefined,
          "primaryButtonId"
        )}
      />
    </>
  );
};

export default PayPalOnboardingCompletedSuccessComponent;
