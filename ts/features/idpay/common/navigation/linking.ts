import { PathConfigMap } from "@react-navigation/native";
import { IDPayDetailsRoutes } from "../../initiative/details/navigation";
import { IDPayOnboardingRoutes } from "../../onboarding/navigation/navigator";
import { IDPayPaymentRoutes } from "../../payment/navigation/navigator";

export const idPayLinkingOptions: PathConfigMap = {
  [IDPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN]: {
    path: "idpay/onboarding",
    screens: {
      [IDPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS]: "/:serviceId"
    }
  },
  [IDPayDetailsRoutes.IDPAY_DETAILS_MAIN]: {
    path: "idpay/initiative",
    screens: {
      [IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING]: "/:initiativeId"
    }
  },
  [IDPayPaymentRoutes.IDPAY_PAYMENT_MAIN]: {
    path: "idpay/auth",
    screens: {
      [IDPayPaymentRoutes.IDPAY_PAYMENT_AUTHORIZATION]: "/:trxCode"
    }
  }
};
