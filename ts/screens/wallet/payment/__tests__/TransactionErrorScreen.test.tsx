import configureMockStore from "redux-mock-store";

import { RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { Option, some } from "fp-ts/lib/Option";

import { Detail_v2Enum } from "../../../../../definitions/backend/PaymentProblemJson";
import I18n from "../../../../i18n";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import {
  paymentAttiva,
  paymentIdPolling,
  paymentVerifica
} from "../../../../store/actions/wallet/payment";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { PayloadForAction } from "../../../../types/utils";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import TransactionErrorScreen from "../TransactionErrorScreen";

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

  it("Should render ONGOING screen on PAA_PAGAMENTO_IN_CORSO error code", () => {
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

  it("Should render ONGOING screen on PPT_PAGAMENTO_IN_CORSO error code", () => {
    const { component } = renderComponent(
      some(Detail_v2Enum.PPT_PAGAMENTO_IN_CORSO)
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

  it("Should render NOT_FOUND screen", () => {
    const { component } = renderComponent(
      some(Detail_v2Enum.PAA_PAGAMENTO_SCONOSCIUTO)
    );
    expect(component.queryByTestId("error-code-copy-component")).toBeNull();
    expect(component.queryByTestId("infoScreenTitle")).toHaveTextContent(
      I18n.t("wallet.errors.NOT_FOUND")
    );
    expect(component.queryByTestId("not-found-subtitle")).toHaveTextContent(
      I18n.t("wallet.errors.NOT_FOUND_SUBTITLE").replace("\n", " ")
    );
    expect(component.queryByTestId("closeButtonConfirm")).toBeDefined();
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

  it("Should render DUPLICATED screen on PAA_PAGAMENTO_DUPLICATO error code", () => {
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

  it("Should render DUPLICATED screen on PPT_PAGAMENTO_DUPLICATO error code", () => {
    const { component } = renderComponent(
      some(Detail_v2Enum.PPT_PAGAMENTO_DUPLICATO)
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
    component: renderScreenWithNavigationStoreContext<GlobalState>(
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
