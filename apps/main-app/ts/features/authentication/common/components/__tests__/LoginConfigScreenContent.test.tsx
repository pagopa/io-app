import { fireEvent } from "@testing-library/react-native";
import { ComponentProps } from "react";
import { createStore } from "redux";

import { updateMixpanelSuperProperties } from "../../../../../mixpanelConfig/superProperties";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { isDebugModeEnabledSelector } from "../../../../../store/reducers/debug";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { cieEnvSelector } from "../../../login/cie/store/selectors";
import { CIE_ENVS } from "../../../login/cie/utils";
import { ONE_IDENTITY_ENVS } from "../../store/reducers/loginConfig";
import {
  oneIdentityEnvSelector,
  oneIdentityLocalFeatureFlagSelector
} from "../../store/selectors/loginConfig";
import { LoginConfigScreenContent } from "../LoginConfigScreenContent";

jest.mock("../../../../../mixpanelConfig/superProperties", () => ({
  updateMixpanelSuperProperties: jest.fn()
}));

describe("LoginConfigScreenContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render all controls as disabled when disabled is true", () => {
    const { getByLabelText } = renderComponent({ disabled: true });

    expect(getByLabelText("Usa solo IO")).toBeDisabled();
    expect(getByLabelText("Usa solo OneIdentity")).toBeDisabled();
    expect(getByLabelText("Automatico")).toBeDisabled();
    expect(
      getByLabelText(/Abilita ambiente di UAT OneIdentity/i)
    ).toBeDisabled();
    expect(getByLabelText("CIE produzione")).toBeDisabled();
    expect(getByLabelText("CIE preproduzione")).toBeDisabled();
    expect(getByLabelText("Modalità debug")).toBeDisabled();
  });

  it("should render all controls as enabled when disabled is false", () => {
    const { getByLabelText } = renderComponent({ disabled: false });

    expect(getByLabelText("Usa solo IO")).toBeEnabled();
    expect(getByLabelText("Usa solo OneIdentity")).toBeEnabled();
    expect(getByLabelText("Automatico")).toBeEnabled();
    expect(
      getByLabelText(/Abilita ambiente di UAT OneIdentity/i)
    ).toBeEnabled();
    expect(getByLabelText("CIE produzione")).toBeEnabled();
    expect(getByLabelText("CIE preproduzione")).toBeEnabled();
    expect(getByLabelText("Modalità debug")).toBeEnabled();
  });

  it("should default the CIE environment to production", () => {
    const { store } = renderComponent();

    expect(cieEnvSelector(store.getState())).toBe(CIE_ENVS.PROD);
  });

  it("should dispatch the CIE environment action when a radio option is selected", () => {
    const { store, getByLabelText } = renderComponent();

    fireEvent.press(getByLabelText("CIE preproduzione"));
    expect(cieEnvSelector(store.getState())).toBe(CIE_ENVS.PREPROD);

    fireEvent.press(getByLabelText("CIE produzione"));
    expect(cieEnvSelector(store.getState())).toBe(CIE_ENVS.PROD);
  });

  it("should dispatch the OneIdentity UAT environment action when the checkbox is toggled", () => {
    const { store, getByLabelText } = renderComponent();

    fireEvent.press(getByLabelText(/Abilita ambiente di UAT OneIdentity/i));
    expect(oneIdentityEnvSelector(store.getState())).toBe(
      ONE_IDENTITY_ENVS.UAT
    );
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

  it("should update the Mixpanel super properties with the updated state when a radio option is selected", () => {
    const { store, getByLabelText } = renderComponent();

    fireEvent.press(getByLabelText("Usa solo OneIdentity"));

    expect(updateMixpanelSuperProperties).toHaveBeenCalledTimes(1);
    const [state] = (updateMixpanelSuperProperties as jest.Mock).mock.calls[0];
    expect(state).toBe(store.getState());
    expect(oneIdentityLocalFeatureFlagSelector(state)).toBe(true);
  });

  it("should dispatch the debug mode action when the switch is toggled", () => {
    const { store, getByLabelText } = renderComponent();

    fireEvent(getByLabelText("Modalità debug"), "onValueChange", true);
    expect(isDebugModeEnabledSelector(store.getState())).toBe(true);

    fireEvent(getByLabelText("Modalità debug"), "onValueChange", false);
    expect(isDebugModeEnabledSelector(store.getState())).toBe(false);
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
