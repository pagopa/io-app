import { createStore } from "redux";
import OnboardingPinScreen from "../OnboardingPinScreen";
import { PinCreation } from "../../../settings/security/shared/components/PinCreation";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import ROUTES from "../../../../navigation/routes";

jest.mock("../../../settings/security/shared/components/PinCreation", () => ({
  PinCreation: jest.fn(() => null)
}));

describe("OnboardingPinScreen", () => {
  it("should render PinCreation with isOnboarding=true", () => {
    renderComponent();
    expect(PinCreation).toHaveBeenCalledWith({ isOnboarding: true }, undefined);
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    OnboardingPinScreen,
    ROUTES.ONBOARDING_PIN,
    {},
    store
  );
};
