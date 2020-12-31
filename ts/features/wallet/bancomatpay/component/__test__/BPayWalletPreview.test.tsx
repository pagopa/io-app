import { render } from "@testing-library/react-native";
import * as React from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { BPayPaymentMethod } from "../../../../../types/pagopa";
import BPayWalletPreview from "../BPayWalletPreview";

describe("BPayWalletPreview component", () => {
  const mockStore = configureMockStore();
  // eslint-disable-next-line functional/no-let
  let store: ReturnType<typeof mockStore>;

  const aBPay: BPayPaymentMethod = {
    walletType: "BPay",
    createDate: "2021-07-08",
    enableableFunctions: ["FA", "pagoPA", "BPD"],
    favourite: false,
    idWallet: 25572,
    info: {
      numberObfuscated: "*******0000",
      paymentInstruments: [],
      uidHash:
        "d48a59cdfbe3da7e4fe25e28cbb47d5747720ecc6fc392c87f1636fe95db22f90004"
    },
    onboardingChannel: "IO",
    pagoPA: true,
    updateDate: "2020-11-20",
    kind: "BPay",
    caption: "●●●●●●●0000",
    icon: 37
  } as BPayPaymentMethod;

  beforeEach(() => {
    store = mockStore();
  });
  it("should show the generic bancomatPay string if there isn't the abiInfo and the bankName", () => {
    const component = getComponent(aBPay, store);
    const bankLogo = component.queryByTestId("bankLogoFallback");

    expect(bankLogo).not.toBeNull();
    expect(bankLogo).toHaveTextContent("BANCOMAT Pay");
  });
  it("should show the generic bankName string if there isn't the abiInfo", () => {
    const bankName = "INTESA SANPAOLO - S.P.A.";
    const component = getComponent(
      {
        ...aBPay,
        info: { ...aBPay.info, bankName }
      },
      store
    );
    const bankLogo = component.queryByTestId("bankLogoFallback");

    expect(bankLogo).not.toBeNull();
    expect(bankLogo).toHaveTextContent(bankName);
  });

  it("should show the bankName from the abiInfo if there isn't the logoUrl", () => {
    const infobankName = "a different bank name";
    const abiInfoBankName = "INTESA SANPAOLO - S.P.A.";
    const component = getComponent(
      {
        ...aBPay,
        info: { ...aBPay.info, bankName: infobankName },
        abiInfo: {
          abi: "03069",
          name: abiInfoBankName
        }
      },
      store
    );
    const bankLogo = component.queryByTestId("bankLogoFallback");

    expect(bankLogo).not.toBeNull();
    expect(bankLogo).toHaveTextContent(abiInfoBankName);
  });

  it("should show the logo image if there is the abiInfo logoUrl", () => {
    const infobankName = "a different bank name";
    const abiInfoBankName = "INTESA SANPAOLO - S.P.A.";
    const component = getComponent(
      {
        ...aBPay,
        info: { ...aBPay.info, bankName: infobankName },
        abiInfo: {
          abi: "03069",
          name: abiInfoBankName,
          logoUrl: "http://127.0.0.1:3000/static_contents/logos/abi/03069.png"
        }
      },
      store
    );
    const bankLogo = component.queryByTestId("bankLogoFallback");

    expect(bankLogo).not.toBeNull();
    expect(bankLogo).toHaveTextContent(abiInfoBankName);
  });
});

const getComponent = (bPay: BPayPaymentMethod, store: any) =>
  render(
    <Provider store={store}>
      <BPayWalletPreview bPay={bPay} />
    </Provider>
  );
