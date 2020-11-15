import * as React from "react";
import configureMockStore from "redux-mock-store";
import { render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import * as pot from "italia-ts-commons/lib/pot";
import BancomatBpdToggle from "../BancomatBpdToggle";
import { Abi } from "../../../../../../../definitions/pagopa/walletv2/Abi";
import {
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../model/RemoteValue";
import {
  IndexedById,
  toIndexed
} from "../../../../../../store/helpers/indexer";
import { bancomat } from "../../../store/reducers/__mock__/bancomat";
import I18n from "../../../../../../i18n";
import { EnableableFunctionsTypeEnum } from "../../../../../../types/pagopa";
import { BpdPotPaymentMethodActivation } from "../../../store/reducers/details/paymentMethods";
import { HPan } from "../../../store/actions/paymentMethods";
jest.mock("../../../../../../utils/hooks/useOnFocus", () => ({
  useNavigationContext: () => ({ isFocused: () => true }),
  useActionOnFocus: jest
    .fn()
    .mockImplementation(() => (action: () => void) => action())
}));

jest.mock("@gorhom/bottom-sheet", () => ({
  useBottomSheetModal: () => ({ present: jest.fn(), dismiss: jest.fn() })
}));

const fallbackBankName = I18n.t("wallet.methods.bancomat.name");
describe("BancomatBpdToggle UI states tests", () => {
  const mockStore = configureMockStore();
  it("should display the fallback bank name with no abi", () => {
    const store = mockStore(mockAbiStore(remoteUndefined));
    const component = render(
      <Provider store={store}>
        <BancomatBpdToggle card={bancomat} />
      </Provider>
    );
    expect(component).not.toBeNull();
    const textBankName = component.queryByTestId("paymentMethodCaptionId");
    expect(textBankName).toHaveTextContent(fallbackBankName);
  });

  it("should display the right bank name", () => {
    const store = mockStore(
      mockAbiStore(
        remoteReady(getAbiIndexed([{ abi: "12345", name: "rightName" }]))
      )
    );
    const component = render(
      <Provider store={store}>
        <BancomatBpdToggle
          card={{
            ...bancomat,
            info: { ...bancomat.info, issuerAbiCode: "12345" }
          }}
        />
      </Provider>
    );
    expect(component).not.toBeNull();
    const textBankName = component.queryByTestId("paymentMethodCaptionId");
    expect(textBankName).toHaveTextContent("rightName");
  });

  it("should display the fallback bank name with no matching abi", () => {
    const store = mockStore(
      mockAbiStore(
        remoteReady(getAbiIndexed([{ abi: "12345", name: "rightName" }]))
      )
    );
    const component = render(
      <Provider store={store}>
        <BancomatBpdToggle
          card={{
            ...bancomat,
            info: { ...bancomat.info, issuerAbiCode: "1234" }
          }}
        />
      </Provider>
    );
    expect(component).not.toBeNull();
    const textBankName = component.queryByTestId("paymentMethodCaptionId");
    expect(textBankName).toHaveTextContent(fallbackBankName);
  });

  it("should display an enabled switch in ON state (payment instrument is BPD compliant and enrolled in BPD)", () => {
    const store = mockStore(
      mockAbiStore(
        remoteReady(getAbiIndexed([{ abi: "12345", name: "rightName" }])),
        {
          [bancomat.info!.hashPan!]: pot.some({
            hPan: bancomat.info!.hashPan! as HPan,
            activationStatus: "active",
            activationDate: "2020-11-11"
          })
        }
      )
    );
    const component = render(
      <Provider store={store}>
        <BancomatBpdToggle
          card={{
            ...bancomat,
            enableableFunctions: [EnableableFunctionsTypeEnum.BPD]
          }}
        />
      </Provider>
    );
    expect(component).not.toBeNull();
    const switchBpd = component.queryByTestId("switchPaymentActivationTestID");
    expect(switchBpd).not.toBeNull();
    expect(switchBpd).toBeEnabled();
    expect(switchBpd!.props.value).toBeTruthy();
  });

  it("should display an enabled switch in OFF state (payment instrument is BPD compliant but not enrolled in BPD)", () => {
    const store = mockStore(
      mockAbiStore(
        remoteReady(getAbiIndexed([{ abi: "12345", name: "rightName" }])),
        {
          [bancomat.info!.hashPan!]: pot.some({
            hPan: bancomat.info!.hashPan! as HPan,
            activationStatus: "inactive",
            activationDate: "2020-11-11"
          })
        }
      )
    );
    const component = render(
      <Provider store={store}>
        <BancomatBpdToggle
          card={{
            ...bancomat,
            enableableFunctions: [EnableableFunctionsTypeEnum.BPD]
          }}
        />
      </Provider>
    );
    expect(component).not.toBeNull();
    const switchBpd = component.queryByTestId("switchPaymentActivationTestID");
    expect(switchBpd).not.toBeNull();
    expect(switchBpd).toBeEnabled();
    expect(switchBpd!.props.value).toBeFalsy();
  });

  it("should not display a switch (payment instrument has not BPD capability)", () => {
    const store = mockStore(
      mockAbiStore(
        remoteReady(getAbiIndexed([{ abi: "12345", name: "rightName" }])),
        {
          [bancomat.info!.hashPan!]: pot.some({
            hPan: bancomat.info!.hashPan! as HPan,
            activationStatus: "active",
            activationDate: "2020-11-11"
          })
        }
      )
    );
    const component = render(
      <Provider store={store}>
        <BancomatBpdToggle
          card={{
            ...bancomat,
            enableableFunctions: [EnableableFunctionsTypeEnum.FA]
          }}
        />
      </Provider>
    );
    expect(component).not.toBeNull();
    const switchBpd = component.queryByTestId("switchPaymentActivationTestID");
    expect(switchBpd).toBeNull();
  });

  it("should display an info icon (payment status is inactivable)", () => {
    const store = mockStore(
      mockAbiStore(
        remoteReady(getAbiIndexed([{ abi: "12345", name: "rightName" }])),
        {
          [bancomat.info!.hashPan!]: pot.some({
            hPan: bancomat.info!.hashPan! as HPan,
            activationStatus: "notActivable"
          })
        }
      )
    );
    const component = render(
      <Provider store={store}>
        <BancomatBpdToggle
          card={{
            ...bancomat,
            enableableFunctions: [EnableableFunctionsTypeEnum.BPD]
          }}
        />
      </Provider>
    );
    expect(component).not.toBeNull();
    const switchBpd = component.queryByTestId("switchPaymentActivationTestID");
    expect(switchBpd).toBeNull();
    const infoIcon = component.queryByTestId(
      "infoIconBpdPaymentActivationTestID"
    );
    expect(infoIcon).not.toBeNull();
  });
});

const getAbiIndexed = (abis: ReadonlyArray<Abi>) =>
  toIndexed(abis, a => a.abi!);
const mockAbiStore = (
  abi: RemoteValue<IndexedById<Abi>, Error>,
  paymentMethods: IndexedById<BpdPotPaymentMethodActivation> = {}
) => ({
  bonus: {
    bpd: {
      details: {
        paymentMethods
      }
    }
  },
  wallet: {
    abi
  }
});
