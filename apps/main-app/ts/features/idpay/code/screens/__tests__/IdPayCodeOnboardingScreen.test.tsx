import * as pot from "@pagopa/ts-commons/lib/pot";
import { fireEvent } from "@testing-library/react-native";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { IdPayCodeRoutes } from "../../navigation/routes";
import { IdPayCodeState } from "../../store/reducers";
import { IdPayCodeOnboardingScreen } from "../IdPayCodeOnboardingScreen";

const mockReplace = jest.fn();
const mockPop = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      replace: mockReplace,
      dispatch: jest.fn(),
      isFocused: jest.fn(),
      addListener: () => jest.fn(),
      removeListener: () => jest.fn(),
      getParent: () => undefined,
      pop: mockPop,
      setOptions: jest.fn()
    })
  };
});

const tInitiativeId = "123456";

describe("IdPayCodeOnboardingScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("if the code was already onboarded", () => {
    describe("when continue is pressed", () => {
      it("should enroll the code to the initiative and navigate to the result screen ", () => {
        const { component } = renderComponent(
          {
            isOnboarded: pot.some(true)
          },
          tInitiativeId
        );

        const button = component.getByTestId("wizardPrimaryButtonTestID");

        fireEvent(button, "onPress");

        expect(mockReplace).toHaveBeenCalledWith(
          IdPayCodeRoutes.IDPAY_CODE_MAIN,
          {
            screen: IdPayCodeRoutes.IDPAY_CODE_RESULT
          }
        );
      });
    });
  });

  describe("if the code was not onboarded", () => {
    describe("when continue is pressed", () => {
      it("should display the identification request and generate the code if identification is successfull", () => {
        const { component } = renderComponent({
          isOnboarded: pot.some(false)
        });

        const button = component.getByTestId("wizardPrimaryButtonTestID");

        fireEvent(button, "onPress");

        expect(mockReplace).not.toHaveBeenCalled();

        // ! We are unable to test the identification request
      });
    });
  });
});

const renderComponent = (
  partialCodeState: Partial<IdPayCodeState>,
  initiativeId?: string
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const finalState = {
    ...globalState,
    features: {
      ...globalState.features,
      idPay: {
        ...globalState.features.idPay,
        code: {
          ...globalState.features.idPay.code,
          ...partialCodeState
        }
      }
    }
  } as GlobalState;
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(finalState);

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      IdPayCodeOnboardingScreen,
      IdPayCodeRoutes.IDPAY_CODE_ONBOARDING,
      { initiativeId },
      store
    ),
    store
  };
};
