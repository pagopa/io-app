import * as pot from "@pagopa/ts-commons/lib/pot";
import _ from "lodash";
import { default as React } from "react";
import configureMockStore from "redux-mock-store";
import { WalletInfo } from "../../../../../../definitions/pagopa/ecommerce/WalletInfo";
import { WalletStatusEnum } from "../../../../../../definitions/pagopa/ecommerce/WalletStatus";
import { Wallets } from "../../../../../../definitions/pagopa/ecommerce/Wallets";
import { validTransaction } from "../../../../../__mocks__/paymentPayloads";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { IndexedById } from "../../../../../store/helpers/indexer";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { Transaction } from "../../../../../types/pagopa";
import { NetworkError } from "../../../../../utils/errors";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PaymentsHomeScreen } from "../PaymentsHomeScreen";

jest.mock("react-native-reanimated", () => ({
  ...require("react-native-reanimated/mock"),
  Layout: {
    duration: jest.fn()
  }
}));

const MOCK_WALLET: WalletInfo = {
  walletId: "1",
  creationDate: new Date(),
  applications: [],
  paymentMethodAsset: "",
  paymentMethodId: "",
  status: WalletStatusEnum.CREATED,
  updateDate: new Date(),
  details: {
    type: "",
    maskedNumber: 1,
    instituteCode: 1,
    bankName: ""
  }
};

describe("PaymentsHomeScreen", () => {
  it("should render loading screen", () => {
    const { queryByTestId } = renderComponent({
      transactions: pot.toLoading(pot.none),
      userWallets: pot.toLoading(pot.none)
    });

    expect(
      queryByTestId("PaymentsHomeTransactionsListTestID-loading")
    ).not.toBeNull();
    expect(
      queryByTestId("PaymentsHomeUserMethodsListTestID-loading")
    ).not.toBeNull();
    expect(queryByTestId("PaymentsHomeScreenTestID-cta")).toBeNull();
  });

  it("should render full empty screen content", () => {
    const { queryByTestId } = renderComponent({
      transactions: pot.some({}),
      userWallets: pot.some({ wallets: [] })
    });

    expect(
      queryByTestId("PaymentsHomeEmptyScreenContentTestID")
    ).not.toBeNull();
    expect(
      queryByTestId("PaymentsHomeEmptyScreenContentTestID-pictogram")
    ).not.toBeNull();
    expect(
      queryByTestId("PaymentsHomeUserMethodsListTestID-banner")
    ).toBeNull();
    expect(queryByTestId("PaymentsHomeUserMethodsListTestID")).toBeNull();
    expect(queryByTestId("PaymentsHomeScreenTestID-cta")).toBeNull();
  });

  it("should render empty transactions content", () => {
    const { queryByTestId } = renderComponent({
      transactions: pot.some({}),
      userWallets: pot.some({ wallets: [MOCK_WALLET, MOCK_WALLET] })
    });

    expect(
      queryByTestId("PaymentsHomeEmptyScreenContentTestID")
    ).not.toBeNull();
    expect(
      queryByTestId("PaymentsHomeEmptyScreenContentTestID-pictogram")
    ).toBeNull();
    expect(
      queryByTestId("PaymentsHomeUserMethodsListTestID-banner")
    ).toBeNull();
    expect(queryByTestId("PaymentsHomeUserMethodsListTestID")).not.toBeNull();
    expect(queryByTestId("PaymentsHomeScreenTestID-cta")).toBeNull();
  });

  it("should render empty methods content", () => {
    const { queryByTestId } = renderComponent({
      transactions: pot.some({ [validTransaction.id]: validTransaction }),
      userWallets: pot.some({ wallets: [] }),
      shouldShowAddMethodsBanner: true
    });

    expect(queryByTestId("PaymentsHomeEmptyScreenContentTestID")).toBeNull();
    expect(
      queryByTestId("PaymentsHomeEmptyScreenContentTestID-pictogram")
    ).toBeNull();
    expect(
      queryByTestId("PaymentsHomeUserMethodsListTestID-banner")
    ).not.toBeNull();
    expect(queryByTestId("PaymentsHomeUserMethodsListTestID")).toBeNull();
    expect(queryByTestId("PaymentsHomeScreenTestID-cta")).not.toBeNull();
  });

  it("should not render empty methods content", () => {
    const { queryByTestId } = renderComponent({
      transactions: pot.some({ [validTransaction.id]: validTransaction }),
      userWallets: pot.some({ wallets: [] }),
      shouldShowAddMethodsBanner: false
    });

    expect(queryByTestId("PaymentsHomeEmptyScreenContentTestID")).toBeNull();
    expect(
      queryByTestId("PaymentsHomeEmptyScreenContentTestID-pictogram")
    ).toBeNull();
    expect(
      queryByTestId("PaymentsHomeUserMethodsListTestID-banner")
    ).toBeNull();
    expect(queryByTestId("PaymentsHomeUserMethodsListTestID")).toBeNull();
    expect(queryByTestId("PaymentsHomeScreenTestID-cta")).not.toBeNull();
  });

  it("should render wallets and transactions content", () => {
    const { queryByTestId } = renderComponent({
      transactions: pot.some({ [validTransaction.id]: validTransaction }),
      userWallets: pot.some({ wallets: [MOCK_WALLET] }),
      shouldShowAddMethodsBanner: false
    });

    expect(queryByTestId("PaymentsHomeEmptyScreenContentTestID")).toBeNull();
    expect(
      queryByTestId("PaymentsHomeEmptyScreenContentTestID-pictogram")
    ).toBeNull();
    expect(
      queryByTestId("PaymentsHomeUserMethodsListTestID-banner")
    ).toBeNull();
    expect(queryByTestId("PaymentsHomeUserMethodsListTestID")).not.toBeNull();
    expect(queryByTestId("PaymentsHomeTransactionsListTestID")).not.toBeNull();
    expect(queryByTestId("PaymentsHomeScreenTestID-cta")).not.toBeNull();
  });
});

const renderComponent = ({
  transactions = pot.none,
  userWallets = pot.none,
  shouldShowAddMethodsBanner = true
}: {
  transactions?: pot.Pot<IndexedById<Transaction>, Error>;
  userWallets?: pot.Pot<Wallets, NetworkError>;
  shouldShowAddMethodsBanner?: boolean;
}) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const state: GlobalState = _.merge(null, globalState, {
    wallet: {
      transactions: {
        transactions
      }
    },
    features: {
      payments: {
        payment: {
          userWallets
        },
        home: {
          shouldShowAddMethodsBanner
        }
      }
    }
  } as GlobalState);

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...state
  } as GlobalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <PaymentsHomeScreen />,
    ROUTES.PAYMENTS_HOME,
    {},
    store
  );
};
