import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { getGenericError, getNetworkError } from "../../../../utils/errors";
import { getPaymentsBizEventsTransactionsAction } from "../store/actions";
import { TransactionClient } from "../../common/api/client";
import { getOrFetchWalletSessionToken } from "../../checkout/saga/networking/handleWalletPaymentNewSessionToken";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { SagaCallReturnType } from "../../../../types/utils";
import { readablePrivacyReport } from "../../../../utils/reporters";

const DEFAULT_TRANSACTION_LIST_SIZE = 10;

// eslint-disable-next-line functional/no-let
let count = 0;

export function* handleGetBizEventsTransactions(
  getTransactionList: TransactionClient["getTransactionList"],
  action: ActionType<(typeof getPaymentsBizEventsTransactionsAction)["request"]>
) {
  const sessionToken = yield* getOrFetchWalletSessionToken();

  if (sessionToken === undefined) {
    yield* put(
      getPaymentsBizEventsTransactionsAction.failure({
        ...getGenericError(new Error(`Missing session token`))
      })
    );
    return;
  }
  const getTransactionListRequest = getTransactionList({
    size: action.payload.size || DEFAULT_TRANSACTION_LIST_SIZE,
    Authorization: sessionToken,
    "x-continuation-token": action.payload.continuationToken
  });

  try {
    const getTransactionListResult = (yield* call(
      withRefreshApiCall,
      getTransactionListRequest,
      action
    )) as unknown as SagaCallReturnType<typeof getTransactionList>;

    if (E.isLeft(getTransactionListResult)) {
      yield* put(
        getPaymentsBizEventsTransactionsAction.failure({
          ...getGenericError(
            new Error(readablePrivacyReport(getTransactionListResult.left))
          )
        })
      );
      return;
    }
    if (action.payload.firstLoad) {
      count = 0;
    }
    if (getTransactionListResult.right.status === 200) {
      // action.payload.onSuccess?.(getTransactionListResult.right.headers['x-continuation-token']);
      yield* put(
        getPaymentsBizEventsTransactionsAction.success({
          data: paginatedData(count),
          appendElements: action.payload.firstLoad
        })
      );
      if (count < 2) {
        action.payload.onSuccess?.(count.toString());
        count++;
      } else {
        action.payload.onSuccess?.(undefined);
      }
    } else if (getTransactionListResult.right.status === 404) {
      yield* put(getPaymentsBizEventsTransactionsAction.success({ data: [] }));
    } else if (getTransactionListResult.right.status !== 401) {
      // The 401 status is handled by the withRefreshApiCall
      yield* put(
        getPaymentsBizEventsTransactionsAction.failure({
          ...getGenericError(
            new Error(
              `response status code ${getTransactionListResult.right.status}`
            )
          )
        })
      );
    }
  } catch (e) {
    yield* put(
      getPaymentsBizEventsTransactionsAction.failure({ ...getNetworkError(e) })
    );
  }
}

const paginatedData = (count: number) => {
  const datas = [
    [
      {
        transactionId: "45e8eabb-3b0d-4510-96c6-cca4cb492d3b",
        payeeName: "Zemlak LLC",
        payeeTaxCode: "31500945",
        amount: "424.54",
        transactionDate: "2024-05-14T15:37:21.194Z",
        isCart: true
      },
      {
        transactionId:
          "c5d6da5e-ffa8-4eef-bf74-bb016fc45357" + count.toString(),
        payeeName: "Jacobi, Ullrich and Bernier",
        payeeTaxCode: "31500945",
        amount: "801.73",
        transactionDate: "2024-05-14T15:37:21.195Z",
        isCart: true
      },
      {
        transactionId:
          "c8c0372b-5be7-470f-9998-f698560a3eb8" + count.toString(),
        payeeName: "Schowalter and Sons",
        payeeTaxCode: "31500945",
        amount: "524.01",
        transactionDate: "2024-04-14T15:37:21.195Z",
        isCart: true
      },
      {
        transactionId:
          "732d9733-094c-4f11-9d74-d9d3967052b0" + count.toString(),
        payeeName: "Mraz, Gulgowski and Simonis",
        payeeTaxCode: "262700362",
        amount: "490.01",
        transactionDate: "2024-04-13T15:37:21.195Z",
        isCart: true
      },
      {
        transactionId:
          "b89bcf78-4b70-489c-990b-40e44c497de1" + count.toString(),
        payeeName: "Rogahn, Morar and Bednar",
        payeeTaxCode: "1199250158",
        amount: "720.02",
        transactionDate: "2024-03-12T15:37:21.195Z",
        isCart: true
      },
      {
        transactionId:
          "78eefa73-556b-45ab-96ec-2514ed2be661" + count.toString(),
        payeeName: "Zieme - Hodkiewicz",
        payeeTaxCode: "31500945",
        amount: "171.47",
        transactionDate: "2024-02-14T15:37:21.195Z",
        isCart: true
      },
      {
        transactionId:
          "b1792a8a-7770-4426-a1d1-b825d19e7148" + count.toString(),
        payeeName: "Walsh, Rohan and Feest",
        payeeTaxCode: "262700362",
        amount: "474.90",
        transactionDate: "2024-02-11T15:37:21.195Z",
        isCart: true
      },
      {
        transactionId:
          "9984b60a-dfc3-4009-9ed8-d28589cfd006" + count.toString(),
        payeeName: "Fadel Inc",
        payeeTaxCode: "262700362",
        amount: "940.37",
        transactionDate: "2024-01-14T15:37:21.195Z",
        isCart: true
      },
      {
        transactionId:
          "e274696d-9b5b-48c1-a3bd-c5d1b7f5ad96" + count.toString(),
        payeeName: "Hamill Inc",
        payeeTaxCode: "13756881002",
        amount: "391.64",
        transactionDate: "2024-01-01T15:37:21.195Z",
        isCart: true
      },
      {
        transactionId:
          "0615ff95-266b-415e-a70f-4149b54e2894" + count.toString(),
        payeeName: "Schaefer - Parker",
        payeeTaxCode: "1199250158",
        amount: "868.85",
        transactionDate: "2024-01-01T15:37:21.196Z",
        isCart: true
      }
    ],
    [
      {
        transactionId:
          "99e235bc-fb00-4a0c-bc1b-3dcae1949718" + count.toString(),
        payeeName: "Zemlak LLC",
        payeeTaxCode: "31500945",
        amount: "424.54",
        transactionDate: "2023-05-14T15:37:21.194Z",
        isCart: true
      },
      {
        transactionId:
          "c5d6da5e-ffa8-4eef-bf74-bb016fc45357" + count.toString(),
        payeeName: "Jacobi, Ullrich and Bernier",
        payeeTaxCode: "31500945",
        amount: "801.73",
        transactionDate: "2023-05-14T15:37:21.195Z",
        isCart: true
      },
      {
        transactionId:
          "c8c0372b-5be7-470f-9998-f698560a3eb8" + count.toString(),
        payeeName: "Schowalter and Sons",
        payeeTaxCode: "31500945",
        amount: "524.01",
        transactionDate: "2023-04-14T15:37:21.195Z",
        isCart: true
      },
      {
        transactionId:
          "732d9733-094c-4f11-9d74-d9d3967052b0" + count.toString(),
        payeeName: "Mraz, Gulgowski and Simonis",
        payeeTaxCode: "262700362",
        amount: "490.01",
        transactionDate: "2023-04-13T15:37:21.195Z",
        isCart: true
      },
      {
        transactionId:
          "b89bcf78-4b70-489c-990b-40e44c497de1" + count.toString(),
        payeeName: "Rogahn, Morar and Bednar",
        payeeTaxCode: "1199250158",
        amount: "720.02",
        transactionDate: "2023-03-12T15:37:21.195Z",
        isCart: true
      },
      {
        transactionId:
          "78eefa73-556b-45ab-96ec-2514ed2be661" + count.toString(),
        payeeName: "Zieme - Hodkiewicz",
        payeeTaxCode: "31500945",
        amount: "171.47",
        transactionDate: "2023-02-14T15:37:21.195Z",
        isCart: true
      },
      {
        transactionId:
          "b1792a8a-7770-4426-a1d1-b825d19e7148" + count.toString(),
        payeeName: "Walsh, Rohan and Feest",
        payeeTaxCode: "262700362",
        amount: "474.90",
        transactionDate: "2023-02-11T15:37:21.195Z",
        isCart: true
      },
      {
        transactionId:
          "9984b60a-dfc3-4009-9ed8-d28589cfd006" + count.toString(),
        payeeName: "Fadel Inc",
        payeeTaxCode: "262700362",
        amount: "940.37",
        transactionDate: "2023-01-14T15:37:21.195Z",
        isCart: true
      },
      {
        transactionId:
          "e274696d-9b5b-48c1-a3bd-c5d1b7f5ad96" + count.toString(),
        payeeName: "Hamill Inc",
        payeeTaxCode: "13756881002",
        amount: "391.64",
        transactionDate: "2023-01-01T15:37:21.195Z",
        isCart: true
      },
      {
        transactionId:
          "0615ff95-266b-415e-a70f-4149b54e2894" + count.toString(),
        payeeName: "Schaefer - Parker",
        payeeTaxCode: "1199250158",
        amount: "868.85",
        transactionDate: "2023-01-01T15:37:21.196Z",
        isCart: true
      }
    ],
    [
      {
        transactionId:
          "99e235bc-fb00-4a0c-bc1b-3dcae1949718" + count.toString(),
        payeeName: "Zemlak LLC",
        payeeTaxCode: "31500945",
        amount: "424.54",
        transactionDate: "2022-05-14T15:37:21.194Z",
        isCart: true
      },
      {
        transactionId:
          "c5d6da5e-ffa8-4eef-bf74-bb016fc45357" + count.toString(),
        payeeName: "Jacobi, Ullrich and Bernier",
        payeeTaxCode: "31500945",
        amount: "801.73",
        transactionDate: "2022-05-14T15:37:21.195Z",
        isCart: true
      },
      {
        transactionId:
          "c8c0372b-5be7-470f-9998-f698560a3eb8" + count.toString(),
        payeeName: "Schowalter and Sons",
        payeeTaxCode: "31500945",
        amount: "524.01",
        transactionDate: "2022-04-14T15:37:21.195Z",
        isCart: true
      },
      {
        transactionId:
          "732d9733-094c-4f11-9d74-d9d3967052b0" + count.toString(),
        payeeName: "Mraz, Gulgowski and Simonis",
        payeeTaxCode: "262700362",
        amount: "490.01",
        transactionDate: "2022-04-13T15:37:21.195Z",
        isCart: true
      },
      {
        transactionId:
          "b89bcf78-4b70-489c-990b-40e44c497de1" + count.toString(),
        payeeName: "Rogahn, Morar and Bednar",
        payeeTaxCode: "1199250158",
        amount: "720.02",
        transactionDate: "2022-03-12T15:37:21.195Z",
        isCart: true
      },
      {
        transactionId:
          "78eefa73-556b-45ab-96ec-2514ed2be661" + count.toString(),
        payeeName: "Zieme - Hodkiewicz",
        payeeTaxCode: "31500945",
        amount: "171.47",
        transactionDate: "2022-02-14T15:37:21.195Z",
        isCart: true
      },
      {
        transactionId:
          "b1792a8a-7770-4426-a1d1-b825d19e7148" + count.toString(),
        payeeName: "Walsh, Rohan and Feest",
        payeeTaxCode: "262700362",
        amount: "474.90",
        transactionDate: "2022-02-11T15:37:21.195Z",
        isCart: true
      },
      {
        transactionId:
          "9984b60a-dfc3-4009-9ed8-d28589cfd006" + count.toString(),
        payeeName: "Fadel Inc",
        payeeTaxCode: "262700362",
        amount: "940.37",
        transactionDate: "2022-01-14T15:37:21.195Z",
        isCart: true
      },
      {
        transactionId:
          "e274696d-9b5b-48c1-a3bd-c5d1b7f5ad96" + count.toString(),
        payeeName: "Hamill Inc",
        payeeTaxCode: "13756881002",
        amount: "391.64",
        transactionDate: "2022-01-01T15:37:21.195Z",
        isCart: true
      },
      {
        transactionId:
          "0615ff95-266b-415e-a70f-4149b54e2894" + count.toString(),
        payeeName: "Schaefer - Parker",
        payeeTaxCode: "1199250158",
        amount: "868.85",
        transactionDate: "2022-01-01T15:37:21.196Z",
        isCart: true
      }
    ]
  ];
  return datas[count];
};
