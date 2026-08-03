import { fireEvent } from "@testing-library/react-native";
import { ComponentProps } from "react";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { isCieLoginUatEnabledSelector } from "../../../login/cie/store/selectors";
import {
  oneIdentityEnvSelector,
  oneIdentityLocalFeatureFlagSelector
} from "../../store/selectors/loginConfig";
import { LoginConfigScreenContent } from "../LoginConfigScreenContent";

describe("LoginConfigScreenContent", () => {
  it("should render all controls as disabled when readOnly is true", () => {
    const { getByLabelText } = renderComponent({ readOnly: true });

    expect(getByLabelText("Login IO")).toBeDisabled();
    expect(getByLabelText("Login OneIdentity")).toBeDisabled();
    expect(
      getByLabelText("Login OneIdentity con rollout remoto")
    ).toBeDisabled();
    expect(
      getByLabelText(/Abilita ambiente di UAT OneIdentity/i)
    ).toBeDisabled();
    expect(getByLabelText(/Abilita endpoint di collaudo/i)).toBeDisabled();
  });

  it("should render all controls as enabled when readOnly is false", () => {
    const { getByLabelText } = renderComponent({ readOnly: false });

    expect(getByLabelText("Login IO")).toBeEnabled();
    expect(getByLabelText("Login OneIdentity")).toBeEnabled();
    expect(
      getByLabelText("Login OneIdentity con rollout remoto")
    ).toBeEnabled();
    expect(
      getByLabelText(/Abilita ambiente di UAT OneIdentity/i)
    ).toBeEnabled();
    expect(getByLabelText(/Abilita endpoint di collaudo/i)).toBeEnabled();
  });

  it("should dispatch CIE UAT enable/disable actions when the checkbox is toggled", () => {
    const { store, getByLabelText } = renderComponent();

    fireEvent.press(getByLabelText(/Abilita endpoint di collaudo/i));
    expect(isCieLoginUatEnabledSelector(store.getState())).toBe(true);

    fireEvent.press(getByLabelText(/Abilita endpoint di collaudo/i));
    expect(isCieLoginUatEnabledSelector(store.getState())).toBe(false);
  });

  it("should dispatch the OneIdentity UAT environment action when the checkbox is toggled", () => {
    const { store, getByLabelText } = renderComponent();

    fireEvent.press(getByLabelText(/Abilita ambiente di UAT OneIdentity/i));
    expect(oneIdentityEnvSelector(store.getState())).toBe("uat");
  });

  it("should dispatch the OneIdentity local feature flag action when a radio option is selected", () => {
    const { store, getByLabelText } = renderComponent();

    fireEvent.press(getByLabelText("Login OneIdentity"));
    expect(oneIdentityLocalFeatureFlagSelector(store.getState())).toBe(true);

    fireEvent.press(getByLabelText("Login IO"));
    expect(oneIdentityLocalFeatureFlagSelector(store.getState())).toBe(false);

    fireEvent.press(getByLabelText("Login OneIdentity con rollout remoto"));
    expect(
      oneIdentityLocalFeatureFlagSelector(store.getState())
    ).toBeUndefined();
  });
});

const renderComponent = ({
  readOnly = false
}: ComponentProps<typeof LoginConfigScreenContent> = {}) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  const utils = renderScreenWithNavigationStoreContext(
    () => <LoginConfigScreenContent readOnly={readOnly} />,
    "DUMMY",
    {},
    store
  );

  return { ...utils, store };
};
