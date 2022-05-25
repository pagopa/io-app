import { fireEvent } from "@testing-library/react-native";
import { createStore, Store } from "redux";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../../utils/testWrapper";
import ROUTES from "../../../../../navigation/routes";
import CdcBonusRequestSelectResidence from "../CdcBonusRequestSelectResidence";
import I18n from "../../../../../i18n";
import { Anno } from "../../../../../../definitions/cdc/Anno";
import { CdcBonusEnrollmentList } from "../../types/CdcBonusRequest";
import { cdcSelectedBonus } from "../../store/actions/cdcBonusRequest";

jest.useFakeTimers();

const mockSelectedBonus: CdcBonusEnrollmentList = [
  { year: "2021" as Anno },
  { year: "2022" as Anno }
];

describe("the CdcBonusRequestSelectResidence screen", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  describe("if selectedBonus is no undefined and greater than 0", () => {
    it("should render the title", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      store.dispatch(cdcSelectedBonus(mockSelectedBonus));
      const component = renderComponent(store);

      expect(component.getByText(I18n.t("bonus.cdc.title"))).toBeDefined();
    });
    it("should render the information text", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      store.dispatch(cdcSelectedBonus(mockSelectedBonus));
      const component = renderComponent(store);
      expect(
        component.getByText(
          I18n.t("bonus.cdc.bonusRequest.selectResidence.info")
        )
      ).toBeDefined();
    });
    it("should render the resident in Italy and resident abroad radio buttons for every year in selectedBonus", () => {
      const store: Store<GlobalState> = createStore(
        appReducer,
        globalState as any
      );
      store.dispatch(cdcSelectedBonus(mockSelectedBonus));
      const component = renderComponent(store);
      const itemResidentInItaly = component.getAllByText(
        I18n.t("bonus.cdc.bonusRequest.selectResidence.items.residesInItaly")
      );
      expect(itemResidentInItaly.length).toEqual(mockSelectedBonus.length);

      const itemResidentAbroad = component.getAllByText(
        I18n.t("bonus.cdc.bonusRequest.selectResidence.items.residesAbroad")
      );
      expect(itemResidentAbroad.length).toEqual(mockSelectedBonus.length);
    });
    describe("when all the radio buttons are checked", () => {
      it("the continue button should be enabled", () => {
        const store: Store<GlobalState> = createStore(
          appReducer,
          globalState as any
        );
        store.dispatch(cdcSelectedBonus(mockSelectedBonus));
        const component = renderComponent(store);
        const itemResidentInItaly = component.getAllByText(
          I18n.t("bonus.cdc.bonusRequest.selectResidence.items.residesInItaly")
        );
        itemResidentInItaly.forEach(r => {
          fireEvent(r, "onPress");
        });

        const continueButton = component.getByText(
          I18n.t("global.buttons.continue")
        );

        expect(continueButton).toBeEnabled();
      });
    });
    describe("when not all the radio button are checked", () => {
      it("the continue button should be disabled", () => {
        const store: Store<GlobalState> = createStore(
          appReducer,
          globalState as any
        );
        store.dispatch(cdcSelectedBonus(mockSelectedBonus));
        const component = renderComponent(store);
        const itemResidentAbroad = component.getAllByText(
          I18n.t("bonus.cdc.bonusRequest.selectResidence.items.residesAbroad")
        );

        if (itemResidentAbroad.length === 2) {
          fireEvent(itemResidentAbroad[0], "onPress");
        }

        const continueButton = component.getByText(
          I18n.t("global.buttons.continue")
        );

        expect(continueButton).toBeDisabled();
      });
    });
  });
});

function renderComponent(store: Store<GlobalState>) {
  return renderScreenFakeNavRedux<GlobalState>(
    CdcBonusRequestSelectResidence,
    ROUTES.MAIN,
    {},
    store
  );
}
