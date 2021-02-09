import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { NavigationParams } from "react-navigation";
import { Action, createStore, Store } from "redux";
import I18n from "../../../../../../../i18n";
import { applicationChangeState } from "../../../../../../../store/actions/application";
import { appReducer } from "../../../../../../../store/reducers";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../../../../utils/testWrapper";
import WALLET_ONBOARDING_COBADGE_ROUTES from "../../../navigation/routes";
import {
  loadCoBadgeAbiConfiguration,
  walletAddCoBadgeStart
} from "../../../store/actions";
import CoBadgeStartScreen from "../CoBadgeStartScreen";

jest.mock("react-native-share", () => jest.fn());

describe("Test behaviour of the CoBadgeStartScreen", () => {
  jest.useFakeTimers();
  it("With the default state, the screen should render CoBadgeChosenBankScreen without Abi", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);

    // check default initial state
    expect(store.getState().wallet.onboarding.coBadge.abiConfiguration).toBe(
      pot.none
    );
    expect(store.getState().wallet.onboarding.coBadge.abiSelected).toBeNull();

    const testComponent = renderCoBadgeScreen(store);

    // render the choose bank screen for all abi
    expect(
      testComponent.queryByTestId("CoBadgeChosenBankScreenAll")
    ).toBeTruthy();

    const participatingBank = testComponent.queryByText(
      I18n.t("wallet.searchAbi.cobadge.description.text2")
    );
    expect(participatingBank).toBeTruthy();
  });
  it("With the configuration loading, the screen should render LoadAbiConfiguration without Abi", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    const abi = "100000";
    store.dispatch(walletAddCoBadgeStart(abi));
    store.dispatch(loadCoBadgeAbiConfiguration.request());

    // check default initial state
    expect(store.getState().wallet.onboarding.coBadge.abiConfiguration).toBe(
      pot.noneLoading
    );
    expect(store.getState().wallet.onboarding.coBadge.abiSelected).toBe(abi);

    const testComponent = renderCoBadgeScreen(store);
    expect(testComponent.queryByTestId("LoadAbiConfiguration")).toBeTruthy();
  });
});

const renderCoBadgeScreen = (store: Store<GlobalState, Action>) =>
  renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    () => <CoBadgeStartScreen />,
    WALLET_ONBOARDING_COBADGE_ROUTES.CHOOSE_TYPE,
    {},
    store
  );
