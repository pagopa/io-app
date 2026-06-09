import { render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { Store, createStore } from "redux";
import I18n from "i18next";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { format } from "../../../utils/dates";
import {
  InitiativeDTO,
  VoucherStatusEnum
} from "../../../../definitions/idpay/InitiativeDTO";
import { IdPayCardStatus } from "../../../features/idpay/details/utils";

jest.mock("react-native-safe-area-context", () => {
  const useSafeAreaInsets = () => ({ top: 0 });
  return {
    useSafeAreaInsets
  };
});

describe("Test BonusCardStatus", () => {
  const T_END_DATE = new Date(2030, 10, 12);

  describe("when the status is ACTIVE", () => {
    const MOCKED_ACTIVE_INITIATIVE = {
      voucherEndDate: T_END_DATE,
      // unused in this test
      voucherStatus: VoucherStatusEnum.ACTIVE,
      nInstr: 1,
      initiativeId: "1"
    } as InitiativeDTO;
    it("should display the correct content", () => {
      const T_VALIDITY_TEXT = I18n.t("idpay.wallet.card.validThrough", {
        endDate: format(T_END_DATE, "DD/MM/YY")
      });
      const { queryByText } = renderComponent(MOCKED_ACTIVE_INITIATIVE);
      expect(queryByText(T_VALIDITY_TEXT)).not.toBeNull();
    });
  });
  describe("when the status is EXPIRING", () => {
    const MOCKED_EXPIRING_INITIATIVE = {
      voucherEndDate: T_END_DATE,
      // unused in this test
      voucherStatus: VoucherStatusEnum.EXPIRING,
      nInstr: 1,
      initiativeId: "1"
    } as InitiativeDTO;
    it("should display the correct content", () => {
      const T_VALIDITY_TEXT = I18n.t("bonusCard.expiring", {
        endDate: format(T_END_DATE, "DD/MM/YY")
      });
      const { queryByText } = renderComponent(MOCKED_EXPIRING_INITIATIVE);
      expect(queryByText(T_VALIDITY_TEXT)).not.toBeNull();
    });
  });
  describe("when the status is EXPIRED", () => {
    const MOCKED_EXPIRED_INITIATIVE = {
      voucherEndDate: T_END_DATE,
      // unused in this test
      voucherStatus: VoucherStatusEnum.EXPIRED,
      nInstr: 1,
      initiativeId: "1"
    } as InitiativeDTO;
    it("should display the correct content", () => {
      const T_VALIDITY_TEXT = I18n.t("idpay.wallet.card.ended", {
        endDate: format(T_END_DATE, "DD/MM/YY")
      });
      const { queryByText } = renderComponent(MOCKED_EXPIRED_INITIATIVE);
      expect(queryByText(T_VALIDITY_TEXT)).not.toBeNull();
    });
  });
  describe("when the status is USED", () => {
    const MOCKED_REMOVED_INITIATIVE = {
      voucherEndDate: T_END_DATE,
      // unused in this test
      voucherStatus: VoucherStatusEnum.USED,
      nInstr: 1,
      initiativeId: "1"
    } as InitiativeDTO;
    it("should display the correct content", () => {
      const T_USED_TEXT = I18n.t("bonusCard.used");
      const { queryByText } = renderComponent({
        ...MOCKED_REMOVED_INITIATIVE
      });
      expect(queryByText(T_USED_TEXT)).not.toBeNull();
    });
  });
});

const renderComponent = (initiative: InitiativeDTO) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const store: Store<GlobalState> = createStore(appReducer, globalState as any);

  return render(
    <Provider store={store}>
      <IdPayCardStatus initiative={initiative} />
    </Provider>
  );
};
