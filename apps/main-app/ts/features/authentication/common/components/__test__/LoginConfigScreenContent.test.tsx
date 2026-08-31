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
  it("should render all controls as disabled when disabled is true", () => {
    const { getByLabelText } = renderComponent({ disabled: true });

    expect(getByLabelText("Usa solo IO")).toBeDisabled();
    expect(getByLabelText("Usa solo OneIdentity")).toBeDisabled();
    expect(getByLabelText("Automatico")).toBeDisabled();
    expect(
      getByLabelText(/Abilita ambiente di UAT OneIdentity/i)
    ).toBeDisabled();
    expect(getByLabelText(/Abilita endpoint di collaudo/i)).toBeDisabled();
  });

  it("should render all controls as enabled when disabled is false", () => {
    const { getByLabelText } = renderComponent({ disabled: false });

    expect(getByLabelText("Usa solo IO")).toBeEnabled();
    expect(getByLabelText("Usa solo OneIdentity")).toBeEnabled();
    expect(getByLabelText("Automatico")).toBeEnabled();
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

    fireEvent.press(getByLabelText("Usa solo OneIdentity"));
    expect(oneIdentityLocalFeatureFlagSelector(store.getState())).toBe(true);

    fireEvent.press(getByLabelText("Usa solo IO"));
    expect(oneIdentityLocalFeatureFlagSelector(store.getState())).toBe(false);

    fireEvent.press(getByLabelText("Automatico"));
    expect(
      oneIdentityLocalFeatureFlagSelector(store.getState())
    ).toBeUndefined();
  });
});

const renderComponent = ({
  disabled = false
}: ComponentProps<typeof LoginConfigScreenContent> = {}) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  const utils = renderScreenWithNavigationStoreContext(
    () => <LoginConfigScreenContent disabled={disabled} />,
    "DUMMY",
    {},
    store
  );

  return { ...utils, store };
};
