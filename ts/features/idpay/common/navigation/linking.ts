import { PathConfigMap } from "@react-navigation/native";
import { IDPayDetailsRoutes } from "../../details/navigation";
import { IdPayPaymentRoutes } from "../../payment/navigation/routes";
import { AppParamsList } from "../../../../navigation/params/AppParamsList";
import { IdPayOnboardingRoutes } from "../../onboarding/navigation/routes";

export const idPayLinkingOptions: PathConfigMap<AppParamsList> = {
  /**
   * IDPay initiative onboarding
   */
  [IdPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN]: {
    path: "idpay/onboarding",
    screens: {
      /**
       * Handles ioit://idpay/onboarding/{initiativeId}
       */
      [IdPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS]: "/:serviceId"
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
  [IdPayPaymentRoutes.IDPAY_PAYMENT_MAIN]: {
    path: "idpay/auth",
    screens: {
      /**
       * Handles ioit://idpay/auth/{trxCode}
       */
      [IdPayPaymentRoutes.IDPAY_PAYMENT_AUTHORIZATION]: "/:trxCode"
    }
  }
};
