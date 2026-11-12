import {
  StatusEnum,
  TransactionBarCodeResponse
} from "@io-app/api-types/generated/definitions/idpay/TransactionBarCodeResponse";
import { IOColors } from "@io-app/design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { fireEvent, render } from "@testing-library/react-native";
import I18n from "i18next";
import { JSX } from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { clipboardSetStringWithFeedback } from "../../../../../utils/clipboard";
import { getNetworkError } from "../../../../../utils/errors";
import { findAllByStyle, withDarkTheme } from "../../../../../utils/testColors";
import { useIDPayStaticCodeModal } from "../useIDPayStaticCodeModal";

jest.mock("../../../../../utils/hooks/bottomSheet", () => ({
  // To immediately render the component, mock the bottom sheet
  useIOBottomSheetModal: (params: {
    component: JSX.Element;
    footer: JSX.Element;
  }) => ({
    bottomSheet: (
      <>
        {params.component}
        {params.footer}
      </>
    ),
    present: jest.fn(),
    dismiss: jest.fn()
  })
}));

jest.mock("../../../../../utils/clipboard", () => ({
  clipboardSetStringWithFeedback: jest.fn()
}));

const defaultParams = {
  initiativeId: "initiativeId",
  initiativeName: "initiativeName",
  onDismiss: jest.fn()
};

const barcodeData = {
  id: "id",
  initiativeId: "initiativeId",
  initiativeName: "initiativeName",
  residualBudgetCents: 100,
  status: StatusEnum.CREATED,
  trxCode: "trxCode",
  trxDate: new Date(),
  trxExpirationSeconds: 99999999
} as TransactionBarCodeResponse;

const renderHook = (state: GlobalState, theme: "dark" | "light" = "light") => {
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...state
  } as GlobalState);

  const Component = () => {
    const { bottomSheet } = useIDPayStaticCodeModal(defaultParams);
    return bottomSheet;
  };

  const Themed = theme === "dark" ? withDarkTheme(Component) : Component;

  return render(
    <Provider store={store}>
      <Themed />
    </Provider>
  );
};

const globalState = appReducer(undefined, applicationChangeState("active"));
describe("useIDPayStaticCodeModal component", () => {
  it("should render modal loading state", () => {
    const loadingState = {
      ...globalState,
      features: {
        ...globalState.features,
        idPay: {
          ...globalState.features.idPay,
          staticCode: {
            [defaultParams.initiativeId]: pot.someLoading(barcodeData)
          }
        }
      }
    };

    const { getByTestId } = renderHook(loadingState);

    expect(getByTestId("idpay-static-code-skeleton")).toBeTruthy();
  });
  it("should render modal success state and copy barcode on press", () => {
    const mockClipboard = clipboardSetStringWithFeedback as jest.Mock;

    const successState = {
      ...globalState,
      features: {
        ...globalState.features,
        idPay: {
          ...globalState.features.idPay,
          staticCode: {
            [defaultParams.initiativeId]: pot.some(barcodeData)
          }
        }
      }
    };

    const { getByText } = renderHook(successState);

    expect(
      getByText(
        I18n.t(
          "idpay.initiative.beneficiaryDetails.staticCodeModal.content.subtitle"
        )
      )
    ).toBeTruthy();

    const copyButton = getByText(
      I18n.t("idpay.initiative.beneficiaryDetails.staticCodeModal.footer")
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
          staticCode: {
            [defaultParams.initiativeId]: pot.noneError(
              getNetworkError(new Error("network error"))
            )
          }
        }
      }
    };

    const { queryByText } = renderHook(errorState);

    expect(
      queryByText(
        I18n.t(
          "idpay.initiative.beneficiaryDetails.staticCodeModal.content.subtitle"
        )
      )
    ).toBeFalsy();
  });

  it.each([
    { name: "loading", value: pot.someLoading(barcodeData) },
    { name: "ready", value: pot.some(barcodeData) }
  ])(
    "should draw the $name barcode box border with the dark stroke token in dark mode",
    ({ value }) => {
      const state = {
        ...globalState,
        features: {
          ...globalState.features,
          idPay: {
            ...globalState.features.idPay,
            staticCode: { [defaultParams.initiativeId]: value }
          }
        }
      };
      const { toJSON } = renderHook(state, "dark");

      expect(
        findAllByStyle(toJSON(), {
          borderColor: IOColors.dark.stroke.default,
          borderWidth: 1
        })
      ).toHaveLength(1);
    }
  );
});
