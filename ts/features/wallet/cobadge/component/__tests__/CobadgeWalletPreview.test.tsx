import { NavigationAction } from "@react-navigation/native";
import { fireEvent } from "@testing-library/react-native";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { Store } from "redux";
import configureMockStore from "redux-mock-store";
import { ToolEnum } from "../../../../../../definitions/content/AssistanceToolConfig";
import { BackendStatus } from "../../../../../../definitions/content/BackendStatus";
import { Config } from "../../../../../../definitions/content/Config";
import NavigationService from "../../../../../navigation/NavigationService";
import ROUTES from "../../../../../navigation/routes";
import { CreditCardPaymentMethod } from "../../../../../types/pagopa";
import { renderScreenFakeNavRedux } from "../../../../../utils/testWrapper";
import * as hooks from "../../../onboarding/bancomat/screens/hooks/useImageResize";
import CobadgeWalletPreview from "../CobadgeWalletPreview";

jest.mock("../../../onboarding/bancomat/screens/hooks/useImageResize");
describe("CobadgeWalletPreview component", () => {
  const mockStore = configureMockStore();
  // eslint-disable-next-line functional/no-let
  let store: ReturnType<typeof mockStore>;

  const aCobadgeCard: CreditCardPaymentMethod = {
    walletType: "Card",
    createDate: "2021-07-08",
    enableableFunctions: ["FA", "pagoPA", "BPD"],
    favourite: false,
    idWallet: 25572,
    info: {
      blurredNumber: "0001",
      brand: "Maestro",
      brandLogo:
        "https://wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_maestro.png",
      expireMonth: "11",
      expireYear: "2021",
      hashPan:
        "d48a59cdfbe3da7e4fe25e28cbb47d5747720ecc6fc392c87f1636fe95db22f90004",
      holder: "Maria Rossi",
      htokenList: ["token1", "token2"],
      issuerAbiCode: "08161",
      type: "PP"
    },
    onboardingChannel: "IO",
    pagoPA: false,
    updateDate: "2020-11-20",
    kind: "CreditCard",
    caption: "●●●●0001",
    icon: 37
  } as CreditCardPaymentMethod;

  beforeEach(() => {
    store = mockStore({
      backendStatus: {
        status: O.some({
          config: {
            assistanceTool: { tool: ToolEnum.none },
            cgn: { enabled: true },
            fims: { enabled: true }
          } as Config
        } as BackendStatus)
      }
    });
  });
  it("should show the caption if useImageResize return none", () => {
    const myspy = jest.spyOn(hooks, "useImageResize").mockReturnValue(O.none);
    const component = getComponent(aCobadgeCard, store);
    const bankLogo = component.queryByTestId("bankLogoFallback");

    expect(bankLogo).not.toBeNull();
    expect(bankLogo).toHaveTextContent(aCobadgeCard.caption);
    expect(myspy).toHaveBeenCalledTimes(1);
  });

  it("should show nothing if useImageResize return a size but there isn't the logoUrl", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(O.some([15, 15]));
    const component = getComponent(aCobadgeCard, store);
    const bankLogo = component.queryByTestId("bankLogo");
    const bankLogoFallback = component.queryByTestId("bankLogoFallback");

    expect(bankLogo).toBeNull();
    expect(bankLogoFallback).toBeNull();
  });

  it("should show the logo image if there is the abiInfo logoUrl", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(O.some([15, 15]));

    const infobankName = "a different bank name";
    const abiInfoBankName = "INTESA SANPAOLO - S.P.A.";
    const logoUrl = "http://127.0.0.1:3000/static_contents/logos/abi/03069.png";
    const component = getComponent(
      {
        ...aCobadgeCard,
        info: { ...aCobadgeCard.info, bankName: infobankName },
        abiInfo: {
          abi: "03069",
          name: abiInfoBankName,
          logoUrl
        }
      },
      store
    );
    const bankLogo = component.queryByTestId("bankLogo");

    expect(bankLogo).not.toBeNull();
    expect(bankLogo).toHaveProp("source", { uri: logoUrl });
  });

  it("should show a visa card icon if in the info there is the corresponding name", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(O.some([15, 15]));
    const component = getComponent(
      {
        ...aCobadgeCard,
        info: {
          brandLogo: "carta_visaelectron"
        }
      },
      store
    );

    const defaultBrandLogoUrl =
      "../../../img/wallet/cards-icons/visa-electron.png";
    const defaultBrandLogo = component.queryByTestId("cardImage");

    expect(defaultBrandLogo).toHaveProp("source", {
      testUri: defaultBrandLogoUrl
    });
  });
  it("should show a default card icon if in the info there isn't the brandlogo", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(O.some([15, 15]));
    const component = getComponent(
      {
        ...aCobadgeCard,
        info: { ...aCobadgeCard.info, brandLogo: undefined }
      },
      store
    );

    const defaultBrandLogoUrl = "../../../img/wallet/cards-icons/unknown.png";
    const defaultBrandLogo = component.queryByTestId("cardImage");

    expect(defaultBrandLogo).toHaveProp("source", {
      testUri: defaultBrandLogoUrl
    });
  });

  it("should call navigateToCobadgeDetails when press on it", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(O.none);
    const spy = jest.spyOn(NavigationService, "dispatchNavigationAction");
    const component = getComponent(aCobadgeCard, store);
    const cardComponent = component.queryByTestId("cardPreview");
    const expectedPayload: NavigationAction = {
      type: "NAVIGATE",
      payload: {
        name: ROUTES.WALLET_NAVIGATOR,
        params: {
          screen: ROUTES.WALLET_COBADGE_DETAIL,
          params: {
            cobadge: aCobadgeCard
          }
        }
      }
    };
    if (cardComponent) {
      fireEvent.press(cardComponent);
      expect(spy).toHaveBeenCalledWith(expectedPayload);
    }
  });
});

const getComponent = (
  cobadge: CreditCardPaymentMethod,
  store: Store<unknown>
) =>
  renderScreenFakeNavRedux(
    () => <CobadgeWalletPreview cobadge={cobadge} />,
    "WALLET_HOME",
    {},
    store
  );
