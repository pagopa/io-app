import * as pot from "@pagopa/ts-commons/lib/pot";
import I18n from "i18next";
import { createStore } from "redux";
import { BonusAvailable } from "../../../../../../../definitions/content/BonusAvailable";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import CGN_ROUTES from "../../../navigation/routes";
import CgnInformationScreen from "../CgnInformationScreen";
import { ID_CGN_TYPE } from "../../../../common/utils";

const mockCgnBonus: BonusAvailable = {
  id_type: ID_CGN_TYPE,
  is_active: true,
  valid_from: new Date("2025-01-01T00:00:00.000Z"),
  valid_to: new Date("2027-01-01T00:00:00.000Z"),
  it: {
    name: "Carta Giovani Nazionale",
    title: "CGN title",
    subtitle: "CGN subtitle",
    content: "CGN content"
  },
  en: {
    name: "National Youth Card",
    title: "CGN title",
    subtitle: "CGN subtitle",
    content: "CGN content"
  }
};

const renderComponent = (state: GlobalState) =>
  renderScreenWithNavigationStoreContext<GlobalState>(
    CgnInformationScreen,
    CGN_ROUTES.ACTIVATION.INFORMATION_TOS,
    {},
    createStore(appReducer, state as any)
  );

describe("CgnInformationScreen", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  it("should not render cgn info if bonus is not available", () => {
    const { queryByText } = renderComponent(globalState);
    expect(queryByText(I18n.t("bonus.cgn.name"))).not.toBeTruthy();
  });
  it("should render cgn info if bonus is available", () => {
    const state = {
      ...globalState,
      bonus: {
        ...globalState.bonus,
        availableBonusTypes: pot.some([mockCgnBonus])
      }
    } as unknown as GlobalState;
    const { getByText } = renderComponent(state);
    expect(getByText(I18n.t("bonus.cgn.cta.activeBonus"))).toBeTruthy();
  });
});
