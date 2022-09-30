import * as pot from "@pagopa/ts-commons/lib/pot";
import { fireEvent, RenderAPI } from "@testing-library/react-native";
import * as React from "react";

import { Action, createStore, Store } from "redux";
import { StatusEnum } from "../../../../../../../../definitions/pagopa/cobadge/configuration/CoBadgeService";
import { CoBadgeServices } from "../../../../../../../../definitions/pagopa/cobadge/configuration/CoBadgeServices";
import I18n from "../../../../../../../i18n";
import { applicationChangeState } from "../../../../../../../store/actions/application";
import { appReducer } from "../../../../../../../store/reducers";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { getGenericError } from "../../../../../../../utils/errors";
import { renderScreenFakeNavRedux } from "../../../../../../../utils/testWrapper";
import { loadAbi } from "../../../../bancomat/store/actions";
import WALLET_ONBOARDING_COBADGE_ROUTES from "../../../navigation/routes";
import {
  loadCoBadgeAbiConfiguration,
  walletAddCoBadgeStart
} from "../../../store/actions";
import CoBadgeStartScreen from "../CoBadgeStartScreen";

jest.mock("react-native-share", () => jest.fn());

const configurationFailure = getGenericError(new Error("generic Error"));
const abiTestId = "9876";
const abiTestId2 = "2222";
const abiConfigurationWithoutBankMock: CoBadgeServices = {
  ServiceName: {
    status: StatusEnum.enabled,
    issuers: [{ abi: "1", name: "bankName" }]
  }
};
const abiConfigurationDisabled: CoBadgeServices = {
  ServiceName: {
    status: StatusEnum.disabled,
    issuers: [{ abi: abiTestId, name: "bankName" }]
  }
};
const abiConfigurationUnavailable: CoBadgeServices = {
  ServiceName: {
    status: StatusEnum.unavailable,
    issuers: [{ abi: abiTestId, name: "bankName" }]
  }
};
const abiConfigurationEnabled: CoBadgeServices = {
  ServiceName: {
    status: StatusEnum.enabled,
    issuers: [
      { abi: abiTestId, name: "bankName1" },
      { abi: abiTestId2, name: "bankName2" }
    ]
  }
};

describe("Test behaviour of the CoBadgeStartScreen", () => {
  jest.useFakeTimers();
  it("With the default state, the screen should render LoadingErrorComponent if the abiList is different from remoteReady", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    // check default initial state
    expect(store.getState().wallet.onboarding.coBadge.abiConfiguration).toBe(
      pot.none
    );
    expect(store.getState().wallet.onboarding.coBadge.abiSelected).toBeNull();

    const testComponent = renderCoBadgeScreen(store);

    expect(isAbiListLoadingError(testComponent)).toBe(true);
  });
  it("With the configuration loading and a specific abi, the screen should render LoadAbiConfiguration (loading state)", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(walletAddCoBadgeStart(abiTestId));
    store.dispatch(loadCoBadgeAbiConfiguration.request());

    // check default initial state
    expect(store.getState().wallet.onboarding.coBadge.abiConfiguration).toBe(
      pot.noneLoading
    );
    expect(store.getState().wallet.onboarding.coBadge.abiSelected).toBe(
      abiTestId
    );

    const testComponent = renderCoBadgeScreen(store);
    expect(isLoadingScreen(testComponent)).toBe(true);

    // check the loading state for the loading error component
    expect(
      testComponent.queryByTestId("LoadingErrorComponentLoading")
    ).toBeTruthy();
    expect(
      testComponent.queryByText(
        I18n.t("wallet.onboarding.coBadge.start.loading")
      )
    ).toBeTruthy();

    store.dispatch(
      loadCoBadgeAbiConfiguration.failure({
        kind: "generic",
        value: new Error()
      })
    );
    expect(
      testComponent.queryByTestId("LoadingErrorComponentError")
    ).toBeTruthy();
  });
  it("With the configuration error and a specific abi, the screen should render LoadAbiConfiguration (loading state)", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(walletAddCoBadgeStart(abiTestId));
    store.dispatch(loadCoBadgeAbiConfiguration.failure(configurationFailure));

    // check default initial state
    expect(
      store.getState().wallet.onboarding.coBadge.abiConfiguration
    ).toStrictEqual(pot.noneError(configurationFailure));
    expect(store.getState().wallet.onboarding.coBadge.abiSelected).toBe(
      abiTestId
    );

    const testComponent = renderCoBadgeScreen(store);

    // When the component is mounted with coBadgeConfiguration pot.Error, the component try to reload the state
    expect(
      store.getState().wallet.onboarding.coBadge.abiConfiguration
    ).toStrictEqual(pot.noneLoading);

    expect(isLoadingScreen(testComponent)).toBe(true);

    // check the loading state for the loading error component
    expect(
      testComponent.queryByTestId("LoadingErrorComponentLoading")
    ).toBeTruthy();
  });
  it("When receive an error during the loading, the screen should render LoadAbiConfiguration (error state)", () => {
    const { store, testComponent } = getInitCoBadgeStartScreen(abiTestId);

    store.dispatch(loadCoBadgeAbiConfiguration.failure(configurationFailure));
    // After an error, the component switch to "error" mode
    expect(isLoadingScreen(testComponent)).toBe(true);
    // check the error state for the loading error component
    expect(
      testComponent.queryByTestId("LoadingErrorComponentError")
    ).toBeTruthy();

    const retryButton = testComponent.queryByText(
      I18n.t("global.buttons.retry")
    );
    expect(retryButton).toBeTruthy();
    if (retryButton !== null) {
      // If the user press the retry button, the state change to LoadingErrorComponentLoading
      fireEvent.press(retryButton);
      expect(
        testComponent.queryByTestId("LoadingErrorComponentLoading")
      ).toBeTruthy();
    }
  });
  it("When receive a configuration without the selected abi, the screen should render CoBadgeStartKoDisabled", () => {
    const { store, testComponent } = getInitCoBadgeStartScreen(abiTestId);

    store.dispatch(
      loadCoBadgeAbiConfiguration.success(abiConfigurationWithoutBankMock)
    );
    // The user should see the disabled screen when the selected abi is not in the remote configuration
    expect(isDisabledScreen(testComponent)).toBe(true);
  });
  it("When receive a configuration without an abi disabled, the screen should render CoBadgeStartKoDisabled", () => {
    const { store, testComponent } = getInitCoBadgeStartScreen(abiTestId);

    store.dispatch(
      loadCoBadgeAbiConfiguration.success(abiConfigurationDisabled)
    );
    // The user should see the disabled screen
    expect(isDisabledScreen(testComponent)).toBe(true);
  });
  it("When receive a configuration with an abi unavailable, the screen should render CoBadgeStartKoUnavailable", () => {
    const { store, testComponent } = getInitCoBadgeStartScreen(abiTestId);

    store.dispatch(
      loadCoBadgeAbiConfiguration.success(abiConfigurationUnavailable)
    );
    // The user should see the unavailable screen
    expect(isUnavailableScreen(testComponent)).toBe(true);
  });
  it("When receive a configuration with an abi enabled, and the abiList is not remoteReady the screen should render AbiListLoadingError", () => {
    const { store, testComponent } = getInitCoBadgeStartScreen(abiTestId);
    store.dispatch(
      loadCoBadgeAbiConfiguration.success(abiConfigurationEnabled)
    );
    // if the selected abi is not in the abi list, the user will see a generic text:
    expect(isAbiListLoadingError(testComponent)).toBe(true);
    const bankName = "abiBankName";
    store.dispatch(
      loadAbi.success({ data: [{ abi: abiTestId, name: bankName }] })
    );
  });
  it("When receive a configuration with an abi enabled, and the abiList is remoteReady the screen should render CoBadgeChosenBankScreen", () => {
    const { store, testComponent } = getInitCoBadgeStartScreen(abiTestId);
    const bankName = "abiBankName";
    store.dispatch(
      loadAbi.success({ data: [{ abi: abiTestId, name: bankName }] })
    );
    store.dispatch(
      loadCoBadgeAbiConfiguration.success(abiConfigurationEnabled)
    );

    // if the selected abi is in the abi list,
    // the user will see the name of the bank instead of the generic "all bank"
    // The name displayed to the user is taken from abiListSelector
    // The user should see the single bank screen
    expect(isCoBadgeChosenSingleBankScreen(testComponent)).toBe(true);
    expect(testComponent.queryByText(bankName)).toBeTruthy();
  });
  it("When change the configuration, CoBadgeChosenBankScreen should update (check memoization)", () => {
    const { store, testComponent } = getInitCoBadgeStartScreen(abiTestId);
    const bankName = "abiBankName1";
    const bankName2 = "abiBankName2";
    store.dispatch(
      loadAbi.success({
        data: [
          { abi: abiTestId, name: bankName },
          { abi: abiTestId2, name: bankName2 }
        ]
      })
    );

    store.dispatch(
      loadCoBadgeAbiConfiguration.success(abiConfigurationEnabled)
    );
    // The user should see the single bank screen
    expect(isCoBadgeChosenSingleBankScreen(testComponent)).toBe(true);

    expect(testComponent.queryByText(bankName)).toBeTruthy();

    store.dispatch(walletAddCoBadgeStart(abiTestId2));

    expect(testComponent.queryByText(bankName2)).toBeTruthy();
  });
});

/**
 * Initialize a CoBadgeStartScreen, that pass in loading state after the mount
 * @param abi
 */
const getInitCoBadgeStartScreen = (abi: string) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  store.dispatch(walletAddCoBadgeStart(abi));
  const testComponent = renderCoBadgeScreen(store);
  return { store, testComponent };
};

const renderCoBadgeScreen = (store: Store<GlobalState, Action>) =>
  renderScreenFakeNavRedux<GlobalState>(
    () => <CoBadgeStartScreen />,
    WALLET_ONBOARDING_COBADGE_ROUTES.CHOOSE_TYPE,
    {},
    store
  );

const isLoadingScreen = (component: RenderAPI) =>
  component.queryByTestId("LoadAbiConfiguration") !== null;

const isDisabledScreen = (component: RenderAPI) =>
  component.queryByTestId("CoBadgeStartKoDisabled") !== null;

const isUnavailableScreen = (component: RenderAPI) =>
  component.queryByTestId("CoBadgeStartKoUnavailable") !== null;

const isCoBadgeChosenSingleBankScreen = (component: RenderAPI) =>
  component.queryByTestId("CoBadgeChosenBankScreenSingleBank") !== null;

const isAbiListLoadingError = (component: RenderAPI) =>
  component.queryByTestId("abiListLoadingError") !== null;
