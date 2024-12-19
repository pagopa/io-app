import { createStore, Store } from "redux";
import { Anno } from "../../../../../../definitions/cdc/Anno";
import { StatoBeneficiarioEnum } from "../../../../../../definitions/cdc/StatoBeneficiario";
import { BonusAvailable } from "../../../../../../definitions/content/BonusAvailable";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { loadAvailableBonuses } from "../../../common/store/actions/availableBonusesTypes";
import { cdcRequestBonusList } from "../../store/actions/cdcBonusRequest";
import { CdcBonusRequest } from "../../types/CdcBonusRequest";
import CdcServiceCTA from "../CdcServiceCTA";

jest.useFakeTimers();

const mockActivableBonus: CdcBonusRequest = {
  year: "2018" as Anno,
  status: StatoBeneficiarioEnum.ATTIVABILE
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

const bonusMockContent = {
  name: "MockCartadellacultura",
  description: "MockDescription",
  subtitle: "MockSubtitle",
  title: "MockTitle",
  content: "<body>MockContent</body>",
  tos_url: "https://io.italia.it/mockTosUrl"
};

const mockBonus: BonusAvailable = {
  id_type: 4,
  it: bonusMockContent,
  en: bonusMockContent,
  valid_from: new Date(),
  valid_to: new Date(),
  is_active: false
};

describe("CdcServiceCTA", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  describe("When the allAvailableBonusTypes is potSome and the cdc bonus is different from undefined", () => {
    it("Should show the activateCardButton if the cdcBonusRequestList is ready and there is at least a card with the status Activable", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      store.dispatch(loadAvailableBonuses.success([mockBonus]));
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
      store.dispatch(loadAvailableBonuses.success([mockBonus]));
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
      store.dispatch(loadAvailableBonuses.success([mockBonus]));
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
      store.dispatch(loadAvailableBonuses.success([mockBonus]));
      const component = renderComponent(store);
      const activityIndicator = component.getByTestId("rn-activity-indicator");

      expect(activityIndicator).toBeDefined();
    });
  });
  it("Should show the activityIndicator if the allAvailableBonusTypes is potNoneLoading or potSomeLoading", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    const component = renderComponent(store);
    const activityIndicator = component.getByTestId("rn-activity-indicator");

    expect(activityIndicator).toBeDefined();
    store.dispatch(loadAvailableBonuses.success([mockBonus]));
    store.dispatch(loadAvailableBonuses.request());
    expect(activityIndicator).toBeDefined();
  });
  it("Should show the ErrorButton if the allAvailableBonusTypes is potNoneError or potSomeError", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    const component = renderComponent(store);
    store.dispatch(loadAvailableBonuses.failure(new Error()));
    const retryButton = component.getByTestId("retryButton");
    expect(retryButton).toBeDefined();
    store.dispatch(loadAvailableBonuses.success([mockBonus]));
    store.dispatch(loadAvailableBonuses.failure(new Error()));
    expect(retryButton).toBeDefined();
  });
  it("Should return null if the allAvailableBonusTypes is potSome but the cdcBonus is not available", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    const component = renderComponent(store);
    store.dispatch(
      loadAvailableBonuses.success([{ ...mockBonus, id_type: 1 }])
    );
    const activateCardButton = component.queryByTestId("activateCardButton");
    const pendingCardButton = component.queryByTestId("pendingCardButton");

    expect(activateCardButton).toBeNull();
    expect(pendingCardButton).toBeNull();
  });
});

function renderComponent(store: Store<GlobalState>) {
  return renderScreenWithNavigationStoreContext<GlobalState>(
    CdcServiceCTA,
    ROUTES.MAIN,
    {},
    store
  );
}
