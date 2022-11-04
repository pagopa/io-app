import { createFetchRequestForApi } from "@pagopa/ts-commons/lib/requests";
import { Iban } from "../../../../../definitions/backend/Iban";
import { InitializedProfile } from "../../../../../definitions/backend/InitializedProfile";
import { PayoffInstrTypeEnum } from "../../../../../definitions/bpd/citizen/CitizenPatchDTO";
import { fetchPaymentManagerLongTimeout } from "../../../../config";
import { defaultRetryingFetch } from "../../../../utils/fetch";
import { awardPeriodsGET } from "./award-period/v1";
import {
  citizenDELETE,
  citizenPaymentMethodPATCH,
  PatchOptions
} from "./citizen/v1";
import {
  citizenV2EnrollPUT,
  citizenV2FindGET,
  citizenV2RankingGET
} from "./citizen/v2";
import {
  paymentInstrumentsDELETE,
  paymentInstrumentsEnrollPUT,
  paymentInstrumentsFindGET
} from "./payment-instrument/v1";
import { winningTransactionsTotalCashbackGET } from "./winning-transactions/v1";
import {
  winningTransactionsV2CountByDayGET,
  winningTransactionsV2GET
} from "./winning-transactions/v2";

const jsonContentType = "application/json; charset=utf-8";

export function BackendBpdClient(
  baseUrl: string,
  token: string,
  fetchApi: typeof fetch = defaultRetryingFetch(
    fetchPaymentManagerLongTimeout,
    0
  )
) {
  const options: PatchOptions = {
    baseUrl,
    fetchApi
  };
  // withBearerToken injects the header "Bearer" with token
  // and "Ocp-Apim-Subscription-Key" with an hard-coded value (perhaps it won't be used)
  type extendHeaders = {
    readonly apiKeyHeader?: string;
    readonly Authorization?: string;
    readonly Bearer?: string;
    ["Ocp-Apim-Subscription-Key"]?: string;
  };

  const withBearerToken =
    <P extends extendHeaders, R>(f: (p: P) => Promise<R>) =>
    async (po: P): Promise<R> => {
      const params = Object.assign({ Bearer: token }, po) as P;
      return f(params);
    };

  return {
    findV2: withBearerToken(
      createFetchRequestForApi(citizenV2FindGET, options)
    ),
    enrollCitizenV2IO: withBearerToken(
      createFetchRequestForApi(citizenV2EnrollPUT, options)
    ),
    deleteCitizenIO: withBearerToken(
      createFetchRequestForApi(citizenDELETE, options)
    ),
    updatePaymentMethod: (iban: Iban, profile: InitializedProfile) =>
      withBearerToken(
        citizenPaymentMethodPATCH(
          options,
          token,
          {
            payoffInstr: iban,
            payoffInstrType: PayoffInstrTypeEnum.IBAN,
            accountHolderCF: profile.fiscal_code as string,
            accountHolderName: profile.name,
            accountHolderSurname: profile.family_name
          },
          { ["Content-Type"]: jsonContentType }
        )
      ),
    findPayment: withBearerToken(
      createFetchRequestForApi(paymentInstrumentsFindGET, options)
    ),
    enrollPayment: withBearerToken(
      createFetchRequestForApi(paymentInstrumentsEnrollPUT, options)
    ),
    deletePayment: withBearerToken(
      createFetchRequestForApi(paymentInstrumentsDELETE, options)
    ),
    awardPeriods: withBearerToken(
      createFetchRequestForApi(awardPeriodsGET, options)
    ),
    totalCashback: withBearerToken(
      createFetchRequestForApi(winningTransactionsTotalCashbackGET, options)
    ),
    winningTransactionsV2: withBearerToken(
      createFetchRequestForApi(winningTransactionsV2GET, options)
    ),
    winningTransactionsV2CountByDay: withBearerToken(
      createFetchRequestForApi(winningTransactionsV2CountByDayGET, options)
    ),
    getRankingV2: withBearerToken(
      createFetchRequestForApi(citizenV2RankingGET, options)
    )
  };
}
