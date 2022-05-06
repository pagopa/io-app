import { createStore, Store } from "redux";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../../utils/testWrapper";
import ROUTES from "../../../../../navigation/routes";
import CdcServiceCTA from "../CdcServiceCTA";
import { cdcRequestBonusList } from "../../store/actions/cdcBonusRequest";
import { CdcBonusRequest } from "../../types/CdcBonusRequest";
import { getTimeoutError } from "../../../../../utils/errors";
import { Anno } from "../../../../../../definitions/cdc/Anno";
import { StatoBeneficiarioEnum } from "../../../../../../definitions/cdc/StatoBeneficiario";

jest.useFakeTimers();

const mockActivableBonus: CdcBonusRequest = {
  year: "2018" as Anno,
  status: StatoBeneficiarioEnum.ATTVABILE
};
const mockPendingBonus: CdcBonusRequest = {
  year: "2018" as Anno,
  status: StatoBeneficiarioEnum.VALUTAZIONE
};
const mockActiveBonus: CdcBonusRequest = {
  year: "2018" as Anno,
  status: StatoBeneficiarioEnum.ATTIVO
};
const mockNotRequestableBonus: CdcBonusRequest = {
  year: "2018" as Anno,
  status: StatoBeneficiarioEnum.INATTIVO
};
const mockExpiredBonus: CdcBonusRequest = {
  year: "2018" as Anno,
  status: StatoBeneficiarioEnum.INATTIVABILE
};
describe("CdcServiceCTA", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  it("Should show the activateCardButton if the cdcBonusRequestList is ready and there is at least a card with the status Activable", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    const component = renderComponent(store);
    store.dispatch(cdcRequestBonusList.success([mockActivableBonus]));
    const activateCardButton = component.getByTestId("activateCardButton");
    expect(activateCardButton).toBeDefined();
  });
  it("Should show the pendingCardButton if the cdcBonusRequestList is ready and there is at least a card with the status Pending and there isn't card with the status Activable", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    const component = renderComponent(store);
    store.dispatch(cdcRequestBonusList.success([mockPendingBonus]));
    const pendingCardButton = component.getByTestId("pendingCardButton");
    expect(pendingCardButton).toBeDefined();
  });
  it("Should return null if the cdcBonusRequestList is ready and there isn't card with the status Activable or Pending", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    const component = renderComponent(store);
    store.dispatch(
      cdcRequestBonusList.success([
        mockActiveBonus,
        mockNotRequestableBonus,
        mockExpiredBonus
      ])
    );
    const activateCardButton = component.queryByTestId("activateCardButton");
    const pendingCardButton = component.queryByTestId("pendingCardButton");

    expect(activateCardButton).toBeNull();
    expect(pendingCardButton).toBeNull();
  });
  it("Should show the activityIndicator if the cdcBonusRequestList is in loading state", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    const component = renderComponent(store);
    const activityIndicator = component.getByTestId("rn-activity-indicator");

    expect(activityIndicator).toBeDefined();
  });
  it("Should show the errorStatusComponent and the retryButton button if the cdcBonusRequestList is in failure state", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    const component = renderComponent(store);
    store.dispatch(cdcRequestBonusList.failure(getTimeoutError()));
    const errorStatusComponent = component.getByTestId("SectionStatusContent");
    const retryButton = component.getByTestId("retryButton");

    expect(errorStatusComponent).toBeDefined();
    expect(retryButton).toBeDefined();
  });
});

function renderComponent(store: Store<GlobalState>) {
  return renderScreenFakeNavRedux<GlobalState>(
    CdcServiceCTA,
    ROUTES.MAIN,
    {},
    store
  );
}
