import configureMockStore from "redux-mock-store";
import { NavigationParams } from "react-navigation";
import { RptId } from "italia-pagopa-commons/lib/pagopa";
import { Option, some } from "fp-ts/lib/Option";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import ROUTES from "../../../../navigation/routes";
import TransactionErrorScreen from "../TransactionErrorScreen";
import { PayloadForAction } from "../../../../types/utils";
import {
  paymentAttiva,
  paymentIdPolling,
  paymentVerifica
} from "../../../../store/actions/wallet/payment";
import { Detail_v2Enum } from "../../../../../definitions/backend/PaymentProblemJson";
import I18n from "../../../../i18n";

const rptId = {
  organizationFiscalCode: "00000000005",
  paymentNoticeNumber: {
    applicationCode: "69",
    auxDigit: "0",
    checkDigit: "88",
    iuv13: "7598658729311"
  }
} as RptId;
const onCancel = jest.fn();

describe("TransactionErrorScreen", () => {
  jest.useFakeTimers();

  it("Should render technical screen", () => {
    const { component } = renderComponent(
      some(Detail_v2Enum.PPT_CANALE_DISABILITATO)
    );
    expect(component.queryByTestId("error-code-copy-component")).toBeDefined();
    expect(component.queryByTestId("error-code")).toHaveTextContent(
      Detail_v2Enum.PPT_CANALE_DISABILITATO
    );
    expect(component.queryByTestId("infoScreenTitle")).toHaveTextContent(
      I18n.t("wallet.errors.TECHNICAL")
    );
    expect(component.queryByTestId("sendReportButtonConfirm")).toBeDefined();
    expect(component.queryByTestId("closeButtonCancel")).toBeDefined();
  });

  it("Should render data screen", () => {
    const { component } = renderComponent(
      some(Detail_v2Enum.PPT_SINTASSI_EXTRAXSD)
    );
    expect(component.queryByTestId("error-code-copy-component")).toBeDefined();
    expect(component.queryByTestId("error-code")).toHaveTextContent(
      Detail_v2Enum.PPT_SINTASSI_EXTRAXSD
    );
    expect(component.queryByTestId("infoScreenTitle")).toHaveTextContent(
      I18n.t("wallet.errors.DATA")
    );
    expect(component.queryByTestId("sendReportButtonCcancel")).toBeDefined();
    expect(component.queryByTestId("backButtonConfirm")).toBeDefined();
  });

  it("Should render EC screen", () => {
    const { component } = renderComponent(
      some(Detail_v2Enum.PPT_STAZIONE_INT_PA_TIMEOUT)
    );
    expect(component.queryByTestId("error-code-copy-component")).toBeDefined();
    expect(component.queryByTestId("error-code")).toHaveTextContent(
      Detail_v2Enum.PPT_STAZIONE_INT_PA_TIMEOUT
    );
    expect(component.queryByTestId("infoScreenTitle")).toHaveTextContent(
      I18n.t("wallet.errors.EC")
    );
    expect(component.queryByTestId("sendReportButtonConfirm")).toBeDefined();
    expect(component.queryByTestId("closeButtonCancel")).toBeDefined();
  });

  it("Should render ONGOING screen", () => {
    const { component } = renderComponent(
      some(Detail_v2Enum.PAA_PAGAMENTO_IN_CORSO)
    );
    expect(component.queryByTestId("error-code-copy-component")).toBeNull();
    expect(component.queryByTestId("infoScreenTitle")).toHaveTextContent(
      I18n.t("wallet.errors.ONGOING")
    );
    expect(component.queryByTestId("ongoing-subtitle")).toHaveTextContent(
      I18n.t("wallet.errors.ONGOING_SUBTITLE")
    );
    expect(component.queryByTestId("sendReportButtonCcancel")).toBeDefined();
    expect(component.queryByTestId("closeButtonConfirm")).toBeDefined();
  });

  it("Should render REVOKED screen", () => {
    const { component } = renderComponent(
      some(Detail_v2Enum.PAA_PAGAMENTO_ANNULLATO)
    );
    expect(component.queryByTestId("error-code-copy-component")).toBeNull();
    expect(component.queryByTestId("infoScreenTitle")).toHaveTextContent(
      I18n.t("wallet.errors.REVOKED")
    );
    expect(component.queryByTestId("revoked-subtitle")).toHaveTextContent(
      I18n.t("wallet.errors.contactECsubtitle")
    );
    expect(component.queryByTestId("closeButtonCancel")).toBeDefined();
  });

  it("Should render EXPIRED screen", () => {
    const { component } = renderComponent(
      some(Detail_v2Enum.PAA_PAGAMENTO_SCADUTO)
    );
    expect(component.queryByTestId("error-code-copy-component")).toBeNull();
    expect(component.queryByTestId("infoScreenTitle")).toHaveTextContent(
      I18n.t("wallet.errors.EXPIRED")
    );
    expect(component.queryByTestId("expired-subtitle")).toHaveTextContent(
      I18n.t("wallet.errors.contactECsubtitle")
    );
    expect(component.queryByTestId("closeButtonCancel")).toBeDefined();
  });

  it("Should render DUPLICATED screen", () => {
    const { component } = renderComponent(
      some(Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO)
    );
    expect(component.queryByTestId("error-code-copy-component")).toBeNull();
    expect(component.queryByTestId("infoScreenTitle")).toHaveTextContent(
      I18n.t("wallet.errors.DUPLICATED")
    );
    expect(component.queryByTestId("revoked-subtitle")).toBeNull();
    expect(component.queryByTestId("expired-subtitle")).toBeNull();
    expect(component.queryByTestId("closeButtonCancel")).toBeDefined();
  });

  it("Should render UNCOVERED screen", () => {
    const { component } = renderComponent(
      some(Detail_v2Enum.PPT_RT_SCONOSCIUTA)
    );
    expect(component.queryByTestId("error-code-copy-component")).toBeNull();
    expect(component.queryByTestId("infoScreenTitle")).toHaveTextContent(
      I18n.t("wallet.errors.GENERIC_ERROR")
    );
    expect(component.queryByTestId("revoked-subtitle")).toBeNull();
    expect(component.queryByTestId("expired-subtitle")).toBeNull();
    expect(component.queryByTestId("generic-error-subtitle")).toHaveTextContent(
      I18n.t("wallet.errors.GENERIC_ERROR_SUBTITLE")
    );
    expect(component.queryByTestId("sendReportButtonCcancel")).toBeDefined();
    expect(component.queryByTestId("closeButtonConfirm")).toBeDefined();
  });
});

const renderComponent = (
  error: Option<
    PayloadForAction<
      | typeof paymentVerifica["failure"]
      | typeof paymentAttiva["failure"]
      | typeof paymentIdPolling["failure"]
    >
  >
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState
  } as GlobalState);

  return {
    component: renderScreenFakeNavRedux<GlobalState, NavigationParams>(
      TransactionErrorScreen,
      ROUTES.PAYMENT_TRANSACTION_ERROR,
      {
        error,
        rptId,
        onCancel
      },
      store
    ),
    store
  };
};
