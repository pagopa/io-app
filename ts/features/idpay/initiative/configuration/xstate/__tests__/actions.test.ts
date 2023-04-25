/* eslint-disable no-underscore-dangle */
import * as O from "fp-ts/lib/Option";
import * as p from "@pagopa/ts-commons/lib/pot";
import { createActionsImplementation } from "../actions";
import { ConfigurationMode, Context } from "../context";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../../../navigation/params/AppParamsList";
import { IDPayConfigurationRoutes } from "../../navigation/navigator";
import ROUTES from "../../../../../../navigation/routes";
import { IDPayDetailsRoutes } from "../../../details/navigation";
import { InitiativeFailureType } from "../failure";
import I18n from "../../../../../../i18n";
import * as showToast from "../../../../../../utils/showToast";

jest.mock("../../../../../../utils/showToast", () => ({
  showToast: jest.fn()
}));

const navigation: Partial<IOStackNavigationProp<AppParamsList>> = {
  navigate: jest.fn(),
  replace: jest.fn(),
  pop: jest.fn()
};

const T_CONTEXT: Context = {
  initiative: p.none,
  mode: ConfigurationMode.COMPLETE,
  ibanList: p.none,
  walletInstruments: [],
  initiativeInstruments: [],
  instrumentStatuses: {}
};

const T_INITIATIVE_ID = "123456";

const T_NO_EVENT = { type: "" };
const T_BACK_EVENT = { type: "BACK", skipNavigation: true };

const T_FAILURE = InitiativeFailureType.GENERIC;

describe("IDPay Configuration machine actions", () => {
  const actions = createActionsImplementation(
    navigation as IOStackNavigationProp<AppParamsList>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("navigateToConfigurationIntro", () => {
    it("should throw error if initiativeId is not provided in context", async () => {
      expect(() => {
        actions.navigateToConfigurationIntro(T_CONTEXT, { type: "" });
      }).toThrow("initiativeId is undefined");
      expect(navigation.navigate).toHaveBeenCalledTimes(0);
    });

    it("should navigate to screen", async () => {
      actions.navigateToConfigurationIntro(
        { ...T_CONTEXT, initiativeId: T_INITIATIVE_ID },
        T_NO_EVENT
      );
      expect(navigation.navigate).toHaveBeenCalledWith(
        IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN,
        {
          screen: IDPayConfigurationRoutes.IDPAY_CONFIGURATION_INTRO,
          params: {
            initiativeId: T_INITIATIVE_ID
          }
        }
      );
    });

    it("should not navigate to screen if BACK event with skipNavigation set to true", async () => {
      actions.navigateToConfigurationIntro(
        { ...T_CONTEXT, initiativeId: T_INITIATIVE_ID },
        T_BACK_EVENT
      );
      expect(navigation.navigate).toHaveBeenCalledTimes(0);
    });
  });

  describe("navigateToIbanLandingScreen", () => {
    it("should navigate to screen", async () => {
      actions.navigateToIbanLandingScreen(T_CONTEXT, T_NO_EVENT);
      expect(navigation.navigate).toHaveBeenCalledWith(
        IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN,
        {
          screen: IDPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_LANDING
        }
      );
    });

    it("should not navigate to screen if BACK event with skipNavigation set to true", async () => {
      actions.navigateToIbanLandingScreen(T_CONTEXT, T_BACK_EVENT);
      expect(navigation.navigate).toHaveBeenCalledTimes(0);
    });
  });

  describe("navigateToIbanOnboardingScreen", () => {
    it("should navigate to screen", async () => {
      actions.navigateToIbanOnboardingScreen(T_CONTEXT, T_NO_EVENT);
      expect(navigation.navigate).toHaveBeenCalledWith(
        IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN,
        {
          screen: IDPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ONBOARDING
        }
      );
    });

    it("should not navigate to screen if BACK event with skipNavigation set to true", async () => {
      actions.navigateToIbanOnboardingScreen(T_CONTEXT, T_BACK_EVENT);
      expect(navigation.navigate).toHaveBeenCalledTimes(0);
    });
  });

  describe("navigateToIbanEnrollmentScreen", () => {
    it("should navigate to screen", async () => {
      actions.navigateToIbanEnrollmentScreen(T_CONTEXT, T_NO_EVENT);
      expect(navigation.navigate).toHaveBeenCalledWith(
        IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN,
        {
          screen: IDPayConfigurationRoutes.IDPAY_CONFIGURATION_IBAN_ENROLLMENT,
          params: {}
        }
      );
    });

    it("should not navigate to screen if BACK event with skipNavigation set to true", async () => {
      actions.navigateToIbanEnrollmentScreen(T_CONTEXT, T_BACK_EVENT);
      expect(navigation.navigate).toHaveBeenCalledTimes(0);
    });
  });

  describe("navigateToAddPaymentMethodScreen", () => {
    it("should navigate to screen", async () => {
      actions.navigateToAddPaymentMethodScreen(T_CONTEXT, T_NO_EVENT);
      expect(navigation.replace).toHaveBeenCalledWith(ROUTES.WALLET_NAVIGATOR, {
        screen: ROUTES.WALLET_ADD_PAYMENT_METHOD,
        params: { inPayment: O.none }
      });
    });

    it("should not navigate to screen if BACK event with skipNavigation set to true", async () => {
      actions.navigateToAddPaymentMethodScreen(T_CONTEXT, T_BACK_EVENT);
      expect(navigation.navigate).toHaveBeenCalledTimes(0);
    });
  });

  describe("navigateToInstrumentsEnrollmentScreen", () => {
    it("should navigate to screen", async () => {
      actions.navigateToInstrumentsEnrollmentScreen(T_CONTEXT, T_NO_EVENT);
      expect(navigation.navigate).toHaveBeenCalledWith(
        IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN,
        {
          screen:
            IDPayConfigurationRoutes.IDPAY_CONFIGURATION_INSTRUMENTS_ENROLLMENT,
          params: {}
        }
      );
    });

    it("should not navigate to screen if BACK event with skipNavigation set to true", async () => {
      actions.navigateToInstrumentsEnrollmentScreen(T_CONTEXT, T_BACK_EVENT);
      expect(navigation.navigate).toHaveBeenCalledTimes(0);
    });
  });

  describe("navigateToConfigurationSuccessScreen", () => {
    it("should navigate to screen", async () => {
      actions.navigateToConfigurationSuccessScreen();
      expect(navigation.navigate).toHaveBeenCalledWith(
        IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN,
        {
          screen: IDPayConfigurationRoutes.IDPAY_CONFIGURATION_SUCCESS
        }
      );
    });
  });

  describe("navigateToInitiativeDetailScreen", () => {
    it("should throw error if initiativeId is not provided in context", async () => {
      expect(() => {
        actions.navigateToInitiativeDetailScreen(T_CONTEXT);
      }).toThrow("initiativeId is undefined");
      expect(navigation.navigate).toHaveBeenCalledTimes(0);
    });

    it("should navigate to screen", async () => {
      actions.navigateToInitiativeDetailScreen({
        ...T_CONTEXT,
        initiativeId: T_INITIATIVE_ID
      });
      expect(navigation.navigate).toHaveBeenCalledWith(
        IDPayDetailsRoutes.IDPAY_DETAILS_MAIN,
        {
          screen: IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING,
          params: { initiativeId: T_INITIATIVE_ID }
        }
      );
    });
  });

  describe("showFailureToast", () => {
    it("should show toast", async () => {
      const showToastSpy = jest.spyOn(showToast, "showToast");
      actions.showFailureToast({ ...T_CONTEXT, failure: T_FAILURE });
      expect(showToastSpy).toHaveBeenCalledWith(
        I18n.t(`idpay.configuration.failureStates.${T_FAILURE}`),
        "danger"
      );
    });
  });

  describe("showUpdateIbanToast", () => {
    it("should show toast", async () => {
      const showToastSpy = jest.spyOn(showToast, "showToast");
      actions.showUpdateIbanToast();
      expect(showToastSpy).toHaveBeenCalledWith(
        I18n.t(`idpay.configuration.iban.updateToast`),
        "success"
      );
    });
  });

  describe("exitConfiguration", () => {
    it("should close screen", async () => {
      actions.exitConfiguration();
      expect(navigation.pop).toHaveBeenCalledTimes(1);
    });
  });
});
