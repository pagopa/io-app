import * as pot from "@pagopa/ts-commons/lib/pot";
import { render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import I18n from "i18next";
import { WalletInfo } from "../../../../../../definitions/pagopa/walletv3/WalletInfo";
import { WalletStatusEnum } from "../../../../../../definitions/pagopa/walletv3/WalletStatus";
import { applicationChangeState } from "../../../../../store/actions/application";
import { Store } from "../../../../../store/actions/types";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import WalletDetailsPaymentMethodFeatures from "../WalletDetailsPaymentMethodFeatures";
import { StatusEnum } from "../../../../../../definitions/idpay/InitiativesStatusDTO";

const globalState = appReducer(undefined, applicationChangeState("active"));
const mockStore = configureMockStore<GlobalState>();
const store: ReturnType<typeof mockStore> = mockStore(globalState);

const renderComponent = (paymentMethod: WalletInfo, isIdPayEnabled = false) => {
  const enrichedStore: Store = {
    ...store,
    getState: () => ({
      // state.features.idPay.wallet
      ...store.getState(),
      features: {
        ...store.getState().features,
        backendStatus: {
          remoteConfig: {
            isIdPayEnabled
          }
        },
        idPay: {
          ...store.getState().features.idPay,
          wallet: {
            onboardingSucceeded: false,
            initiativesAwaitingStatusUpdate: {},
            initiatives: pot.none,
            initiativeWaitingList: pot.none,
            initiativesWithInstrument: pot.some({
              brand: "",
              idWallet: "",
              initiativeList: [
                {
                  initiativeId: "initiative1",
                  initiativeName: "Initiative 1",
                  status: StatusEnum.ACTIVE
                },
                {
                  initiativeId: "initiative2",
                  initiativeName: "Initiative 2",
                  status: StatusEnum.INACTIVE
                }
              ],
              maskedPan: ""
            })
          }
        }
      }
    })
  };

  return render(
    <Provider store={enrichedStore}>
      <WalletDetailsPaymentMethodFeatures paymentMethod={paymentMethod} />
    </Provider>
  );
};

describe("WalletDetailsPaymentMethodFeatures", () => {
  it("should render expired message on expired payment method", () => {
    const paymentMethod: WalletInfo = {
      walletId: "1",
      creationDate: new Date(),
      applications: [],
      paymentMethodAsset: "",
      paymentMethodId: "",
      status: WalletStatusEnum.CREATED,
      clients: {},
      updateDate: new Date(),
      details: {
        type: "",
        maskedNumber: 1,
        instituteCode: 1,
        bankName: "",
        expiryDate: "202103"
      }
    };
    const { getByText } = renderComponent(paymentMethod);

    expect(getByText(I18n.t("wallet.methodDetails.expired"))).toBeDefined();
  });

  it("should render initiatives and settings when payment method is valid", () => {
    const paymentMethod: WalletInfo = {
      walletId: "1",
      creationDate: new Date(),
      applications: [],
      paymentMethodAsset: "",
      paymentMethodId: "",
      status: WalletStatusEnum.CREATED,
      clients: {},
      updateDate: new Date(),
      details: {
        type: "",
        maskedNumber: 1,
        instituteCode: 1,
        bankName: ""
      }
    };
    const { getByText } = renderComponent(paymentMethod);

    expect(getByText(I18n.t("global.buttons.settings"))).toBeDefined();
  });

  it("should render IDPay parts when remote flag is enabled", () => {
    const paymentMethod: WalletInfo = {
      walletId: "1",
      creationDate: new Date(),
      applications: [],
      paymentMethodAsset: "",
      paymentMethodId: "",
      status: WalletStatusEnum.CREATED,
      clients: {},
      updateDate: new Date(),
      details: {
        type: "",
        maskedNumber: 1,
        instituteCode: 1,
        bankName: ""
      }
    };
    const { queryByText } = renderComponent(paymentMethod, true);

    expect(queryByText(I18n.t("wallet.capability.title"))).toBeNull();
  });
});
