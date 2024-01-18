import * as React from "react";

import { Alert } from "react-native";
import { createStore, Store } from "redux";
import configureMockStore from "redux-mock-store";
import { BonusVisibilityEnum } from "../../../../../../definitions/content/BonusVisibility";
import I18n from "../../../../../i18n";
import { applicationChangeState } from "../../../../../store/actions/application";
import { backendStatusLoadSuccess } from "../../../../../store/actions/backendStatus";
import { appReducer } from "../../../../../store/reducers";
import { baseRawBackendStatus } from "../../../../../store/reducers/__mock__/backendStatus";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { availableBonuses, bpdBonus } from "../../../__mock__/availableBonuses";
import { ID_BPD_TYPE } from "../../../common/utils";
import AvailableBonusScreen from "../../../common/screens/AvailableBonusScreen";
import { loadAvailableBonuses } from "../../../common/store/actions/availableBonusesTypes";
import { BONUS_ROUTES } from "../../../common/navigation/navigator";

jest.mock("../../../../../config", () => ({ bpdEnabled: true }));

jest.spyOn(Alert, "alert");

describe("Test AvailableBonusScreen behaviour", () => {
  jest.useFakeTimers();
  it("should not render the Cashback ListItem", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(loadAvailableBonuses.success(availableBonuses));
    const component = renderComponent(store);

    const bpdListItem = component.queryByTestId(
      `AvailableBonusItem-${ID_BPD_TYPE}`
    );
    expect(bpdListItem).toBeNull();
  });
  it("With bpd visibility === hidden, should not be rendered the ListItem for cashback", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      loadAvailableBonuses.success([
        { ...bpdBonus, visibility: BonusVisibilityEnum.hidden }
      ])
    );
    const component = renderComponent(store);

    expect(
      component.queryByTestId(`AvailableBonusItem-${ID_BPD_TYPE}`)
    ).toBeNull();
  });
  it("With remote program_active===true and bpd visibility === visible should not render the ListItem for cashback", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(loadAvailableBonuses.success(availableBonuses));
    store.dispatch(backendStatusLoadSuccess(baseRawBackendStatus));

    const mockStore = configureMockStore<GlobalState>();
    const finalStore: ReturnType<typeof mockStore> = mockStore({
      ...store.getState()
    } as GlobalState);
    const component = renderComponent(finalStore);

    const bpdListItem = component.queryByTestId(
      `AvailableBonusItem-${ID_BPD_TYPE}`
    );

    expect(
      component.queryByText(I18n.t("bonus.state.completed.caption"))
    ).toBeNull();
    expect(
      component.queryByText(I18n.t("wallet.methods.comingSoon"))
    ).toBeNull();

    expect(bpdListItem).toBeNull();
  });
});

const renderComponent = (store: Store) =>
  renderScreenWithNavigationStoreContext<GlobalState>(
    () => <AvailableBonusScreen />,
    BONUS_ROUTES.BONUS_AVAILABLE_LIST,
    {},
    store
  );
