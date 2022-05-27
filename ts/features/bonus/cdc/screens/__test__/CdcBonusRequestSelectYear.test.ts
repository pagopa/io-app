import { createStore, Store } from "redux";
import { fireEvent } from "@testing-library/react-native";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../../utils/testWrapper";
import ROUTES from "../../../../../navigation/routes";
import CdcBonusRequestSelectYear from "../CdcBonusRequestSelectYear";
import * as cdcActions from "../../store/actions/cdcBonusRequest";
import { Anno } from "../../../../../../definitions/cdc/Anno";
import { StatoBeneficiarioEnum } from "../../../../../../definitions/cdc/StatoBeneficiario";

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
  it("Should add and remove the bonus from the list of bonus that the user want to request pressing the checkbox", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    store.dispatch(
      cdcActions.cdcRequestBonusList.success([activableBonuses[0]])
    );
    const component = renderComponent(store);

    const checkBox = component.getByTestId("RawCheckbox");
    const continueButton = component.getByTestId("continueButton");

    expect(checkBox).toBeDefined();

    // Add the year to the list
    fireEvent.press(checkBox);
    // Remove the year from the list
    fireEvent.press(checkBox);
    // Add again the year to the list
    fireEvent.press(checkBox);

    fireEvent.press(continueButton);

    expect(store.getState().bonus.cdc.bonusRequest.selectedBonus).toStrictEqual(
      [{ year: activableBonuses[0].year }]
    );
  });
});

function renderComponent(store: Store<GlobalState>) {
  return renderScreenFakeNavRedux<GlobalState>(
    CdcBonusRequestSelectYear,
    ROUTES.MAIN,
    {},
    store
  );
}
