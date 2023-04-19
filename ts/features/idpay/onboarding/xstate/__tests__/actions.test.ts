/* eslint-disable no-underscore-dangle */
import * as O from "fp-ts/lib/Option";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../../navigation/params/AppParamsList";
import {
  IDPayOnboardingParamsList,
  IDPayOnboardingRoutes,
  IDPayOnboardingStackNavigationProp
} from "../../navigation/navigator";
import { createActionsImplementation } from "../actions";
import { Context } from "../machine";
import { InitiativeDataDTO } from "../../../../../../definitions/idpay/InitiativeDataDTO";

const rootNavigation: Partial<IOStackNavigationProp<AppParamsList>> = {
  navigate: jest.fn(),
  replace: jest.fn()
};

const onboardingNavigation: Partial<
  IDPayOnboardingStackNavigationProp<IDPayOnboardingParamsList>
> = {
  navigate: jest.fn(),
  pop: jest.fn()
};

const T_CONTEXT: Context = {
  failure: O.none,
  initiativeStatus: O.none,
  multiConsentsAnswers: {},
  multiConsentsPage: 0,
  selfDeclarationBoolAnswers: {}
};

const T_SERVICE_ID = "efg456";

const T_NO_EVENT = { type: "" };
const T_BACK_EVENT = { type: "BACK", skipNavigation: true };

const T_INITIATIVE_INFO_DTO: InitiativeDataDTO = {
  initiativeId: "1234",
  description: "",
  initiativeName: "",
  organizationId: "",
  organizationName: "",
  privacyLink: "",
  tcLink: "",
  logoURL: ""
};

describe("IDPay Onboarding machine actions", () => {
  const actions = createActionsImplementation(
    rootNavigation as IOStackNavigationProp<AppParamsList>,
    onboardingNavigation as IDPayOnboardingStackNavigationProp<IDPayOnboardingParamsList>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("navigateToInitiativeDetailsScreen", () => {
    it("should throw error if serviceId is not provided in context", async () => {
      expect(() => {
        actions.navigateToInitiativeDetailsScreen(T_CONTEXT, { type: "" });
      }).toThrow("serviceId is undefined");
      expect(rootNavigation.navigate).toHaveBeenCalledTimes(0);
      expect(onboardingNavigation.navigate).toHaveBeenCalledTimes(0);
    });

    it("should navigate to screen", async () => {
      actions.navigateToInitiativeDetailsScreen(
        { ...T_CONTEXT, serviceId: T_SERVICE_ID },
        T_NO_EVENT
      );
      expect(rootNavigation.navigate).toHaveBeenCalledTimes(0);
      expect(onboardingNavigation.navigate).toHaveBeenCalledWith(
        IDPayOnboardingRoutes.IDPAY_ONBOARDING_INITIATIVE_DETAILS,
        {
          serviceId: T_SERVICE_ID
        }
      );
    });

    it("should not navigate to screen if BACK event with skipNavigation set to true", async () => {
      actions.navigateToInitiativeDetailsScreen(
        { ...T_CONTEXT, serviceId: T_SERVICE_ID },
        T_BACK_EVENT
      );
      expect(rootNavigation.navigate).toHaveBeenCalledTimes(0);
      expect(onboardingNavigation.navigate).toHaveBeenCalledTimes(0);
    });
  });

  describe("navigateToPDNDCriteriaScreen", () => {
    it("should navigate to screen", async () => {
      actions.navigateToPDNDCriteriaScreen(T_CONTEXT, T_NO_EVENT);
      expect(rootNavigation.navigate).toHaveBeenCalledTimes(0);
      expect(onboardingNavigation.navigate).toHaveBeenCalledWith(
        IDPayOnboardingRoutes.IDPAY_ONBOARDING_PDNDACCEPTANCE
      );
    });

    it("should not navigate to screen if BACK event with skipNavigation set to true", async () => {
      actions.navigateToPDNDCriteriaScreen(T_CONTEXT, T_BACK_EVENT);
      expect(rootNavigation.navigate).toHaveBeenCalledTimes(0);
      expect(onboardingNavigation.navigate).toHaveBeenCalledTimes(0);
    });
  });

  describe("navigateToBoolSelfDeclarationsScreen", () => {
    it("should navigate to screen", async () => {
      actions.navigateToBoolSelfDeclarationsScreen(T_CONTEXT, T_NO_EVENT);
      expect(rootNavigation.navigate).toHaveBeenCalledTimes(0);
      expect(onboardingNavigation.navigate).toHaveBeenCalledWith(
        IDPayOnboardingRoutes.IDPAY_ONBOARDING_BOOL_SELF_DECLARATIONS
      );
    });

    it("should not navigate to screen if BACK event with skipNavigation set to true", async () => {
      actions.navigateToBoolSelfDeclarationsScreen(T_CONTEXT, T_BACK_EVENT);
      expect(rootNavigation.navigate).toHaveBeenCalledTimes(0);
      expect(onboardingNavigation.navigate).toHaveBeenCalledTimes(0);
    });
  });

  describe("navigateToMultiSelfDeclarationsScreen", () => {
    it("should navigate to screen", async () => {
      const T_PAGE = 7;

      actions.navigateToMultiSelfDeclarationsScreen(
        { ...T_CONTEXT, multiConsentsPage: T_PAGE },
        T_NO_EVENT
      );
      expect(rootNavigation.navigate).toHaveBeenCalledTimes(0);
      expect(onboardingNavigation.navigate).toHaveBeenCalledWith({
        name: IDPayOnboardingRoutes.IDPAY_ONBOARDING_MULTI_SELF_DECLARATIONS,
        key: String(T_PAGE)
      });
    });

    it("should not navigate to screen if BACK event with skipNavigation set to true", async () => {
      actions.navigateToMultiSelfDeclarationsScreen(T_CONTEXT, T_BACK_EVENT);
      expect(rootNavigation.navigate).toHaveBeenCalledTimes(0);
      expect(onboardingNavigation.navigate).toHaveBeenCalledTimes(0);
    });
  });

  describe("navigateToCompletionScreen", () => {
    it("should navigate to screen", async () => {
      actions.navigateToCompletionScreen();
      expect(rootNavigation.navigate).toHaveBeenCalledTimes(0);
      expect(onboardingNavigation.navigate).toHaveBeenCalledWith(
        IDPayOnboardingRoutes.IDPAY_ONBOARDING_COMPLETION
      );
    });
  });

  describe("navigateToFailureScreen", () => {
    it("should navigate to screen", async () => {
      actions.navigateToFailureScreen();
      expect(rootNavigation.navigate).toHaveBeenCalledTimes(0);
      expect(onboardingNavigation.navigate).toHaveBeenCalledWith(
        IDPayOnboardingRoutes.IDPAY_ONBOARDING_FAILURE
      );
    });
  });

  describe("navigateToInitiativeMonitoringScreen", () => {
    it("should throw error if initiative is not provided in context", async () => {
      expect(() => {
        actions.navigateToInitiativeMonitoringScreen(T_CONTEXT);
      }).toThrow("initiative is undefined");
      expect(rootNavigation.navigate).toHaveBeenCalledTimes(0);
      expect(onboardingNavigation.navigate).toHaveBeenCalledTimes(0);
    });

    it("should navigate to screen", async () => {
      actions.navigateToInitiativeMonitoringScreen({
        ...T_CONTEXT,
        initiative: T_INITIATIVE_INFO_DTO
      });
      expect(rootNavigation.navigate).toHaveBeenCalledTimes(0);
      expect(onboardingNavigation.navigate).toHaveBeenCalledTimes(0);
    });
  });

  describe("exitOnboarding", () => {
    it("should navigate to screen", async () => {
      actions.exitOnboarding();
      expect(rootNavigation.navigate).toHaveBeenCalledTimes(0);
      expect(onboardingNavigation.pop).toHaveBeenCalledTimes(1);
    });
  });
});
