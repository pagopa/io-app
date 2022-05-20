import { createStore, Store } from "redux";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../../utils/testWrapper";
import ROUTES from "../../../../../navigation/routes";
import { Anno } from "../../../../../../definitions/cdc/Anno";
import { CdcSelectedBonusList } from "../../types/CdcBonusRequest";
import {
  cdcEnrollUserToBonus,
  cdcSelectedBonus
} from "../../store/actions/cdcBonusRequest";
import CdcBonusRequestBonusRequested from "../CdcBonusRequestBonusRequested";
import { getGenericError } from "../../../../../utils/errors";

jest.useFakeTimers();

const mockSelectedBonusItaly: CdcSelectedBonusList = [
  { year: "2021" as Anno, residence: "italy" },
  { year: "2022" as Anno, residence: "italy" }
];

describe("the CdcBonusRequestBonusRequested screen", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  describe("if selectedBonus is no undefined and greater than 0", () => {
    it("should render the loadingComponent if the cdcEnrollUserToBonusRequest is loading", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      store.dispatch(cdcSelectedBonus(mockSelectedBonusItaly));
      const component = renderComponent(store);

      expect(component.getByTestId("loadingComponent")).toBeDefined();
    });
    it("should render the CdcGenericError component if the cdcEnrollUserToBonusRequest is in failure state", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      store.dispatch(cdcSelectedBonus(mockSelectedBonusItaly));
      const component = renderComponent(store);
      store.dispatch(
        cdcEnrollUserToBonus.failure(getGenericError(new Error()))
      );
      expect(component.getByTestId("cdcGenericError")).toBeDefined();
    });
    it("should render the CdcRequestCompleted component if the cdcEnrollUserToBonusRequest is ready and the kind is success", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      store.dispatch(cdcSelectedBonus(mockSelectedBonusItaly));
      const component = renderComponent(store);
      store.dispatch(
        cdcEnrollUserToBonus.success({ kind: "success", value: [] })
      );
      expect(component.getByTestId("cdcRequestCompleted")).toBeDefined();
    });
    it("should render the CdcRequestPartiallySuccess component if the cdcEnrollUserToBonusRequest is ready and the kind is partialSuccess", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      store.dispatch(cdcSelectedBonus(mockSelectedBonusItaly));
      const component = renderComponent(store);
      store.dispatch(
        cdcEnrollUserToBonus.success({ kind: "partialSuccess", value: [] })
      );
      expect(component.getByTestId("cdcRequestPartiallySuccess")).toBeDefined();
    });
    it("should render the CdcRequirementsError component if the cdcEnrollUserToBonusRequest is ready and the kind is requirementsError", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      store.dispatch(cdcSelectedBonus(mockSelectedBonusItaly));
      const component = renderComponent(store);
      store.dispatch(
        cdcEnrollUserToBonus.success({ kind: "requirementsError" })
      );
      expect(component.getByTestId("cdcRequirementsError")).toBeDefined();
    });
    it("should render the CdcWrongFormat component if the cdcEnrollUserToBonusRequest is ready and the kind is wrongFormat", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      store.dispatch(cdcSelectedBonus(mockSelectedBonusItaly));
      const component = renderComponent(store);
      store.dispatch(cdcEnrollUserToBonus.success({ kind: "wrongFormat" }));
      expect(component.getByTestId("cdcWrongFormat")).toBeDefined();
    });
    it("should render the CdcGenericError component if the cdcEnrollUserToBonusRequest is ready and the kind is genericError", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      store.dispatch(cdcSelectedBonus(mockSelectedBonusItaly));
      const component = renderComponent(store);
      store.dispatch(cdcEnrollUserToBonus.success({ kind: "genericError" }));
      expect(component.getByTestId("cdcGenericError")).toBeDefined();
    });
  });
  it("should render the CdcGenericError component if selectedBonus is undefined", () => {
    const store: Store<GlobalState> = createStore(
      appReducer,
      globalState as any
    );
    const component = renderComponent(store);
    expect(component.getByTestId("cdcGenericError")).toBeDefined();
  });
});

function renderComponent(store: Store<GlobalState>) {
  return renderScreenFakeNavRedux<GlobalState>(
    CdcBonusRequestBonusRequested,
    ROUTES.MAIN,
    {},
    store
  );
}
