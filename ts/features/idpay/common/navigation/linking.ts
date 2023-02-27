import { PathConfigMap } from "@react-navigation/native";
import { IDPayDetailsRoutes } from "../../initiative/details/navigation";
import { IDPayOnboardingRoutes } from "../../onboarding/navigation/navigator";

export const idPayLinkingOptions: PathConfigMap = {
  [IDPayOnboardingRoutes.IDPAY_ONBOARDING_MAIN]: {
    path: "idpay",
    screens: {
      [IDPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS]:
        "onboarding/:serviceId"
    }
  },
  [IDPayDetailsRoutes.IDPAY_DETAILS_MAIN]: {
    path: "idpay",
    screens: {
      [IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING]: "initiative/:initiativeId"
    }
  }
};
