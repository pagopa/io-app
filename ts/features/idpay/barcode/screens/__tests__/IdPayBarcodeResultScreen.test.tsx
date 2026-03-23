import * as pot from "@pagopa/ts-commons/lib/pot";
import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { createStore } from "redux";
import {
  StatusEnum,
  TransactionBarCodeResponse
} from "../../../../../../definitions/idpay/TransactionBarCodeResponse";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { clipboardSetStringWithFeedback } from "../../../../../utils/clipboard";
import { getNetworkError } from "../../../../../utils/errors";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { IdPayBarcodeRoutes } from "../../navigation/routes";
import { IdPayBarcodeResultScreen } from "../IdPayBarcodeResultScreen";

jest.mock("../../../../../utils/clipboard", () => ({
  clipboardSetStringWithFeedback: jest.fn()
}));

const renderComponent = (state: GlobalState) => {
  const store = createStore(appReducer, state as any);

  return renderScreenWithNavigationStoreContext(
    () => <IdPayBarcodeResultScreen />,
    IdPayBarcodeRoutes.IDPAY_BARCODE_RESULT,
    {
      initiativeId: "initiativeId"
    },
    store
  );
};

const barcodeData = {
  id: "id",
  initiativeId: "initiativeId",
  initiativeName: "initiativeName",
  residualBudgetCents: 100,
  status: StatusEnum.CREATED,
  trxCode: "1234ABC",
  trxDate: new Date(),
  trxExpirationSeconds: 99999999
} as TransactionBarCodeResponse;

const globalState = appReducer(undefined, applicationChangeState("active"));

describe("IdPayBarcodeResultScreen", () => {
  it("should render the loading screen when barcode data is loading", () => {
    const loadingState = {
      ...globalState,
      features: {
        ...globalState.features,
        idPay: {
          ...globalState.features.idPay,
          barcode: {
            ["initiativeId"]: pot.someLoading(barcodeData)
          }
        }
      }
    };

    const { getByTestId } = renderComponent(loadingState);
    expect(getByTestId("idpay-bar-code-loading")).toBeTruthy();
  });

  it("should render the barcode when data is ready", () => {
    const mockClipboard = clipboardSetStringWithFeedback as jest.Mock;

    const successState = {
      ...globalState,
      features: {
        ...globalState.features,
        idPay: {
          ...globalState.features.idPay,
          barcode: {
            ["initiativeId"]: pot.some(barcodeData)
          }
        }
      }
    };

    const { getByText } = renderComponent(successState);

    expect(
      getByText(I18n.t("idpay.barCode.resultScreen.success.header"))
    ).toBeTruthy();

    const copyButton = getByText(
      I18n.t("idpay.barCode.resultScreen.success.copyCodeCta")
    );

    fireEvent.press(copyButton);
    expect(mockClipboard).toHaveBeenCalledWith(barcodeData.trxCode);
  });

  it("should not render modal when there's an error on barcode generation", () => {
    const errorState = {
      ...globalState,
      features: {
        ...globalState.features,
        idPay: {
          ...globalState.features.idPay,
          barcode: {
            ["initiativeId"]: pot.noneError(
              getNetworkError(new Error("network error"))
            )
          }
        }
      }
    };

    const { getByText } = renderComponent(errorState);

    expect(
      getByText(I18n.t("idpay.barCode.resultScreen.error.generic.body"))
    ).toBeTruthy();
  });

  it("should render expired barcode when time is expired", () => {
    const expiredState = {
      ...globalState,
      features: {
        ...globalState.features,
        idPay: {
          ...globalState.features.idPay,
          barcode: {
            ["initiativeId"]: pot.some({
              ...barcodeData,
              trxExpirationSeconds: 0
            })
          }
        }
      }
    };

    const { getByText } = renderComponent(expiredState);
    expect(
      getByText(I18n.t("idpay.barCode.resultScreen.success.expired.header"))
    ).toBeTruthy();
  });
});
