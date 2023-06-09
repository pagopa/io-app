import { PathConfigMap } from "@react-navigation/native";
import { IDPayDetailsRoutes } from "../../initiative/details/navigation";
import { IDPayOnboardingRoutes } from "../../onboarding/navigation/navigator";
import { IDPayPaymentRoutes } from "../../payment/navigation/navigator";

export const idPayLinkingOptions: PathConfigMap = {
  /**
   * IDPay initiative onboarding
   */
  [IDPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN]: {
    path: "idpay/onboarding",
    screens: {
      /**
       * Handles ioit://idpay/onboarding/{initiativeId}
       */
      [IDPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS]: "/:serviceId"
    }
  },
  /**
   * IDPay initiative details
   */
  [IDPayDetailsRoutes.IDPAY_DETAILS_MAIN]: {
    path: "idpay/initiative",
    screens: {
      /**
       * Handles ioit://idpay/initiative/{initiativeId}
       */
      [IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING]: "/:initiativeId"
    }
  },
  /**
   * IDPay payment authorization
   */
  [IDPayPaymentRoutes.IDPAY_PAYMENT_MAIN]: {
    path: "idpay/auth",
    screens: {
      /**
       * Handles ioit://idpay/auth/{trxCode}
       */
      [IDPayPaymentRoutes.IDPAY_PAYMENT_AUTHORIZATION]: "/:trxCode"
    }
  }
};
