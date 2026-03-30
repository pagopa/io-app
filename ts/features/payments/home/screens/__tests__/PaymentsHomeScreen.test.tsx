import * as pot from "@pagopa/ts-commons/lib/pot";
import _ from "lodash";
import configureMockStore from "redux-mock-store";
import { WalletInfo } from "../../../../../../definitions/pagopa/walletv3/WalletInfo";
import { WalletStatusEnum } from "../../../../../../definitions/pagopa/walletv3/WalletStatus";
import { Wallets } from "../../../../../../definitions/pagopa/walletv3/Wallets";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { NetworkError } from "../../../../../utils/errors";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PaymentsHomeScreen } from "../PaymentsHomeScreen";
import { NoticeListItem } from "../../../../../../definitions/pagopa/biz-events/NoticeListItem";

const validTransaction: NoticeListItem = {
  eventId: "0e208420-19dc-490c-8f3f-5772b7249643",
  payeeName: "Hessel, Muller and Kilback",
  isDebtor: true,
  isPayer: false,
  payeeTaxCode: "262700362",
  amount: "246.53",
  noticeDate: "2024-05-08T14:32:45.927Z",
  isCart: true
};

const MOCK_WALLET: WalletInfo = {
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

describe("PaymentsHomeScreen", () => {
  it("should render loading screen", () => {
    const { queryByTestId } = renderComponent({
      transactions: pot.toLoading(pot.none),
      userMethods: pot.toLoading(pot.none)
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
      transactions: pot.some([]),
      userMethods: pot.some({ wallets: [] })
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
      transactions: pot.some([]),
      userMethods: pot.some({ wallets: [MOCK_WALLET, MOCK_WALLET] })
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
      transactions: pot.some([validTransaction]),
      userMethods: pot.some({ wallets: [] }),
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
      transactions: pot.some([validTransaction]),
      userMethods: pot.some({ wallets: [] }),
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
      transactions: pot.some([validTransaction]),
      userMethods: pot.some({ wallets: [MOCK_WALLET] }),
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
  userMethods = pot.none,
  shouldShowAddMethodsBanner = true
}: {
  transactions?: pot.Pot<ReadonlyArray<NoticeListItem>, Error>;
  userMethods?: pot.Pot<Wallets, NetworkError>;
  shouldShowAddMethodsBanner?: boolean;
}) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const state: GlobalState = _.merge(null, globalState, {
    features: {
      payments: {
        wallet: {
          userMethods
        },
        home: {
          shouldShowAddMethodsBanner
        },
        receipt: {
          latestTransactions: transactions
        }
      }
    }
  } as GlobalState);

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(state);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    PaymentsHomeScreen,
    ROUTES.PAYMENTS_HOME,
    {},
    store
  );
};
