import { render } from "@testing-library/react-native";
import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { Abi } from "../../../../../../../definitions/pagopa/walletv2/Abi";
import I18n from "../../../../../../i18n";
import {
  IndexedById,
  toIndexed
} from "../../../../../../store/helpers/indexer";
import { getPaymentMethodHash } from "../../../../../../store/reducers/wallet/wallets";
import {
  BancomatPaymentMethod,
  EnableableFunctionsTypeEnum
} from "../../../../../../types/pagopa";
import { convertWalletV2toWalletV1 } from "../../../../../../utils/walletv2";
import {
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../model/RemoteValue";
import { HPan } from "../../../store/actions/paymentMethods";
import { bancomat } from "../../../store/reducers/__mock__/bancomat";
import { BpdPotPaymentMethodActivation } from "../../../store/reducers/details/paymentMethods";
import BancomatBpdToggle from "../BancomatBpdToggle";

jest.mock("../../../../../../utils/hooks/useOnFocus", () => ({
  useNavigationContext: () => ({ isFocused: () => true }),
  useActionOnFocus: () => (action: () => void) => action()
}));

jest.mock("@gorhom/bottom-sheet", () => ({
  useBottomSheetModal: () => ({ present: jest.fn(), dismiss: jest.fn() })
}));

const bancomatMethod: BancomatPaymentMethod = convertWalletV2toWalletV1(
  bancomat
).paymentMethod as BancomatPaymentMethod;
const hashPan = getPaymentMethodHash(bancomatMethod)!;
const fallbackBankName = I18n.t("wallet.methods.bancomat.name");
describe("BancomatBpdToggle UI states tests", () => {
  const mockStore = configureMockStore();
  it("should display the fallback bank name with no abi", () => {
    const store = mockStore(mockAbiStore(remoteUndefined));
    const component = render(
      <Provider store={store}>
        <BancomatBpdToggle card={bancomatMethod} />
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
            ...bancomatMethod,
            info: {
              ...bancomatMethod.info,
              bancomat: {
                ...bancomatMethod.bancomat,
                issuerAbiCode: "12345"
              }
            }
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
            ...bancomatMethod,
            info: {
              ...bancomatMethod.info,
              bancomat: {
                ...bancomatMethod.bancomat,
                issuerAbiCode: "1234"
              }
            }
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
          [hashPan]: pot.some({
            hPan: hashPan as HPan,
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
            ...bancomatMethod,
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
          [hashPan]: pot.some({
            hPan: hashPan as HPan,
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
            ...bancomatMethod,
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
          [hashPan]: pot.some({
            hPan: hashPan as HPan,
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
            ...bancomatMethod,
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
          [hashPan]: pot.some({
            hPan: hashPan as HPan,
            activationStatus: "notActivable"
          })
        }
      )
    );
    const component = render(
      <Provider store={store}>
        <BancomatBpdToggle
          card={{
            ...bancomatMethod,
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
