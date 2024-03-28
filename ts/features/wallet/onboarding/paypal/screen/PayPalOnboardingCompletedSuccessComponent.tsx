import { FooterWithButtons } from "@pagopa/io-app-design-system";
import React from "react";
import successImage from "../../../../../../img/pictograms/payment-completed.png";
import { InfoScreenComponent } from "../../../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../../../components/infoScreen/imageRendering";
import I18n from "../../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { walletAddPaypalCompleted } from "../store/actions";
import { paypalOnboardingCompletedSelector } from "../store/reducers/onOboardingCompleted";

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
 * @deprecated Replace the screen content with `OperationResultScreen` instead
 * @constructor
 */
const PayPalOnboardingCompletedSuccessComponent = () => {
  const dispatch = useIODispatch();
  const onPaypalCompletion = useIOSelector(paypalOnboardingCompletedSelector);
  // 'payment_method_details' means we want to check the added payment method detail
  // in the payment flow we have to continue the payment
  const locales = getLocales(onPaypalCompletion !== "payment_method_details");
  return (
    <>
      <InfoScreenComponent
        image={renderInfoRasterImage(successImage)}
        title={locales.title}
        body={locales.body}
      />
      <FooterWithButtons
        type="SingleButton"
        primary={{
          type: "Solid",
          buttonProps: {
            label: locales.ctaTitle,
            accessibilityLabel: locales.ctaTitle,
            onPress: () => dispatch(walletAddPaypalCompleted()),
            testID: "primaryButtonId"
          }
        }}
      />
    </>
  );
};

export default PayPalOnboardingCompletedSuccessComponent;
