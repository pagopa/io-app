import * as E from "fp-ts/lib/Either";
import configureMockStore from "redux-mock-store";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { WalletStatusEnum } from "../../../../../../definitions/pagopa/walletv3/WalletStatus";
import { Wallets } from "../../../../../../definitions/pagopa/walletv3/Wallets";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { getDateFromExpiryDate } from "../../../../../utils/dates";
import { getGenericError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { walletAddCards } from "../../../../wallet/store/actions/cards";
import { WalletCard } from "../../../../wallet/types";
import { getPaymentsWalletUserMethods } from "../../store/actions";
import { handleGetPaymentsWalletUserMethods } from "../handleGetPaymentsWalletUserMethods";

describe("handleGetPaymentsWalletUserMethods", () => {
  const T_SESSION_TOKEN = "ABCD";

  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState,
    features: {
      ...globalState.features,
      wallet: {
        ...globalState.features.wallet,
        cards: {}
      }
    }
  } as GlobalState);

  it(`should put ${getType(getPaymentsWalletUserMethods.success)} and ${getType(
    walletAddCards
  )} when response is success`, () => {
    const T_WALLETID = "1234";
    const T_HPAN = "0001";
    const T_EXPIRE_DATE = new Date(2027, 10, 1).toDateString();
    const mockGetWalletsByIdUser = jest.fn();
    const getWalletsByIdUserResponse: Wallets = {
      wallets: [
        {
          walletId: T_WALLETID,
          creationDate: new Date(),
          paymentMethodId: "paymentMethodId",
          paymentMethodAsset: "paymentMethodAsset",
          applications: [],
          clients: {},
          status: WalletStatusEnum.CREATED,
          updateDate: new Date(),
          details: {
            type: "CREDITCARD",
            lastFourDigits: T_HPAN,
            expiryDate: T_EXPIRE_DATE,
            brand: "VISA"
          }
        }
      ]
    };
    const cards: ReadonlyArray<WalletCard> = [
      {
        key: `method_${T_WALLETID}`,
        type: "payment",
        category: "payment",
        walletId: T_WALLETID,
        hpan: T_HPAN,
        brand: "VISA",
        expireDate: getDateFromExpiryDate(T_EXPIRE_DATE),
        holderEmail: undefined,
        holderPhone: undefined,
        isExpired: false
      }
    ];

    testSaga(
      handleGetPaymentsWalletUserMethods,
      mockGetWalletsByIdUser,
      getPaymentsWalletUserMethods.request()
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(E.right({ status: 200, value: getWalletsByIdUserResponse }))
      .put(walletAddCards(cards))
      .next()
      .next(store.getState())
      .put(getPaymentsWalletUserMethods.success(getWalletsByIdUserResponse))
      .next()
      .isDone();
  });

  it(`should put ${getType(
    getPaymentsWalletUserMethods.failure
  )} when response is not success`, () => {
    const mockGetWalletsByIdUser = jest.fn();

    testSaga(
      handleGetPaymentsWalletUserMethods,
      mockGetWalletsByIdUser,
      getPaymentsWalletUserMethods.request()
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(E.right({ status: 400, value: undefined }))
      .put(
        getPaymentsWalletUserMethods.failure(
          getGenericError(new Error(`Error: 400`))
        )
      )
      .next()
      .isDone();
  });

  it(`should put ${getType(
    getPaymentsWalletUserMethods.failure
  )} when getWalletsByIdUser encoders returns an error`, () => {
    const mockGetWalletsByIdUser = jest.fn();

    testSaga(
      handleGetPaymentsWalletUserMethods,
      mockGetWalletsByIdUser,
      getPaymentsWalletUserMethods.request()
    )
      .next()
      .next(T_SESSION_TOKEN)
      .next(E.left([]))
      .put(
        getPaymentsWalletUserMethods.failure({
          ...getGenericError(new Error(readablePrivacyReport([])))
        })
      )
      .next()
      .isDone();
  });
});
