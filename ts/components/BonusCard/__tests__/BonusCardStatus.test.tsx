import { render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { Store, createStore } from "redux";
import I18n from "../../../i18n";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { format } from "../../../utils/dates";
import {
  InitiativeDTO,
  StatusEnum
} from "../../../../definitions/idpay/InitiativeDTO";
import { IdPayCardStatus } from "../../../features/idpay/details/screens/IdPayInitiativeDetailsScreen";

jest.mock("react-native-safe-area-context", () => {
  const useSafeAreaInsets = () => ({ top: 0 });
  return {
    useSafeAreaInsets
  };
});

describe("Test BonusCardStatus", () => {
  describe("when the status is ACTIVE", () => {
    it("should display the correct content", () => {
      const T_END_DATE = new Date(2025, 10, 12);
      const T_VALIDITY_TEXT = I18n.t("bonusCard.validUntil", {
        endDate: format(T_END_DATE, "DD/MM/YY")
      });
      const { queryByText } = renderComponent(new Date(2024, 1, 1), {
        endDate: T_END_DATE,
        // unused in this test
        status: StatusEnum.REFUNDABLE,
        nInstr: 1,
        initiativeId: "1"
      });
      expect(queryByText(T_VALIDITY_TEXT)).not.toBeNull();
    });
  });
  describe("when the status is EXPIRING", () => {
    it("should display the correct content", () => {
      const T_END_DATE = new Date(2025, 10, 12);
      const T_VALIDITY_TEXT = I18n.t("bonusCard.expiring", {
        endDate: format(T_END_DATE, "DD/MM/YY")
      });
      const { queryByText } = renderComponent(new Date(2025, 10, 10), {
        endDate: T_END_DATE,
        // unused in this test
        status: StatusEnum.REFUNDABLE,
        nInstr: 1,
        initiativeId: "1"
      });
      expect(queryByText(T_VALIDITY_TEXT)).not.toBeNull();
    });
  });
  describe("when the status is EXPIRED", () => {
    it("should display the correct content", () => {
      const T_END_DATE = new Date(2025, 10, 12);
      const T_VALIDITY_TEXT = I18n.t("bonusCard.expired", {
        endDate: format(T_END_DATE, "DD/MM/YY")
      });
      const { queryByText } = renderComponent(new Date(2025, 10, 13), {
        endDate: T_END_DATE,
        // unused in this test
        status: StatusEnum.REFUNDABLE,
        nInstr: 1,
        initiativeId: "1"
      });
      expect(queryByText(T_VALIDITY_TEXT)).not.toBeNull();
    });
  });
  describe("when the status is REMOVED", () => {
    it("should display the correct content", () => {
      const T_END_DATE = new Date(2025, 10, 12);
      const T_REMOVED_TEXT = I18n.t("bonusCard.removed");
      const { queryByText } = renderComponent(new Date(2025, 10, 1), {
        status: StatusEnum.UNSUBSCRIBED,
        endDate: T_END_DATE,
        // unused in this test
        nInstr: 1,
        initiativeId: "1"
      });
      expect(queryByText(T_REMOVED_TEXT)).not.toBeNull();
    });
  });
});

const renderComponent = (now: Date, initiative: InitiativeDTO) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const store: Store<GlobalState> = createStore(appReducer, globalState as any);

  return render(
    <Provider store={store}>
      <IdPayCardStatus now={now} initiative={initiative} />
    </Provider>
  );
};
