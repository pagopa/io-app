import { createStore, Store } from "redux";
import { Anno } from "../../../../../../definitions/cdc/Anno";
import { StatoBeneficiarioEnum } from "../../../../../../definitions/cdc/StatoBeneficiario";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as cdcActions from "../../store/actions/cdcBonusRequest";
import CdcBonusRequestSelectYear from "../CdcBonusRequestSelectYear";

jest.useFakeTimers();

const notActivableBonuses = [
  { year: "2021" as Anno, status: StatoBeneficiarioEnum.VALUTAZIONE },
  { year: "2022" as Anno, status: StatoBeneficiarioEnum.ATTIVO },
  { year: "2022" as Anno, status: StatoBeneficiarioEnum.INATTIVO },
  { year: "2023" as Anno, status: StatoBeneficiarioEnum.INATTIVABILE }
];

const activableBonuses = [
  { year: "2021" as Anno, status: StatoBeneficiarioEnum.ATTIVABILE },
  { year: "2022" as Anno, status: StatoBeneficiarioEnum.ATTIVABILE },
  { year: "2023" as Anno, status: StatoBeneficiarioEnum.VALUTAZIONE }
];

describe("CdcBonusRequestSelectYear", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  it("Shouldn't render the component if there cdcBonusRequestList is not ready", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    const component = renderComponent(store);

    expect(component.queryByTestId("CdcBonusRequestSelectYear")).toBeNull();
  });
  it("Shouldn't render the component if there cdcBonusRequestList is ready but there aren't activable bonus", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(cdcActions.cdcRequestBonusList.success(notActivableBonuses));
    const component = renderComponent(store);

    expect(component.queryByTestId("CdcBonusRequestSelectYear")).toBeNull();
  });
  it("Should render the component if there cdcBonusRequestList is ready and there are activable bonus", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(cdcActions.cdcRequestBonusList.success(activableBonuses));
    const component = renderComponent(store);

    expect(component.queryByTestId("CdcBonusRequestSelectYear")).toBeDefined();
  });
  it("Should render the activable bonuses if there cdcBonusRequestList is ready and there are activable bonus", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(cdcActions.cdcRequestBonusList.success(activableBonuses));
    const component = renderComponent(store);

    expect(component.queryByText("2021")).toBeDefined();
    expect(component.queryByText("2022")).toBeDefined();
    expect(component.queryByText("2023")).toBeNull();
  });
});

function renderComponent(store: Store<GlobalState>) {
  return renderScreenWithNavigationStoreContext<GlobalState>(
    CdcBonusRequestSelectYear,
    ROUTES.MAIN,
    {},
    store
  );
}
