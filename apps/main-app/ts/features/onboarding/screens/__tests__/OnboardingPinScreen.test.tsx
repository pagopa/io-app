import { createStore } from "redux";

import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { PinCreation } from "../../../settings/security/shared/components/PinCreation";
import OnboardingPinScreen from "../OnboardingPinScreen";

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
