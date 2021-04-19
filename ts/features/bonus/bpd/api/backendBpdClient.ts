import {
  ApiHeaderJson,
  composeHeaderProducers,
  createFetchRequestForApi,
  MapResponseType
} from "italia-ts-commons/lib/requests";
import { Iban } from "../../../../../definitions/backend/Iban";
import { InitializedProfile } from "../../../../../definitions/backend/InitializedProfile";
import { PayoffInstrTypeEnum } from "../../../../../definitions/bpd/citizen/CitizenPatchDTO";
import {
  enrollmentDecoder,
  findUsingGETDecoder
} from "../../../../../definitions/bpd/citizen/requestTypes";
import {
  EnrollmentT as EnrollmentTV2,
  FindUsingGETT as FindUsingGETTV2
} from "../../../../../definitions/bpd/citizen_v2/requestTypes";
import { fetchPaymentManagerLongTimeout } from "../../../../config";
import { defaultRetryingFetch } from "../../../../utils/fetch";
import { awardPeriodsGET } from "./award-period/v1";
import {
  citizenDELETE,
  citizenEnrollPUT,
  citizenFindGET,
  citizenPaymentMethodPATCH,
  citizenRankingGET,
  PatchOptions
} from "./citizen/v1";
import { bpdHeadersProducers } from "./common";
import { PatchedCitizenV2Resource } from "./patchedTypes";
import {
  paymentInstrumentsDELETE,
  paymentInstrumentsEnrollPUT,
  paymentInstrumentsFindGET
} from "./payment-instrument/v1";
import {
  winningTransactionsGET,
  winningTransactionsTotalCashbackGET
} from "./winning-transactions/v1";

type FindV2UsingGETTExtra = MapResponseType<
  FindUsingGETTV2,
  200,
  PatchedCitizenV2Resource
>;

const findV2T: FindV2UsingGETTExtra = {
  method: "get",
  url: () => `/bpd/io/citizen/v2`,
  query: _ => ({}),
  headers: bpdHeadersProducers(),
  response_decoder: findUsingGETDecoder(PatchedCitizenV2Resource)
};

type EnrollmentV2TTExtra = MapResponseType<
  EnrollmentTV2,
  200,
  PatchedCitizenV2Resource
>;

const enrollCitizenV2IOT: EnrollmentV2TTExtra = {
  method: "put",
  url: () => `/bpd/io/citizen/v2`,
  query: _ => ({}),
  body: _ => "",
  headers: composeHeaderProducers(bpdHeadersProducers(), ApiHeaderJson),
  response_decoder: enrollmentDecoder(PatchedCitizenV2Resource)
};

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

  const withBearerToken = <P extends extendHeaders, R>(
    f: (p: P) => Promise<R>
  ) => async (po: P): Promise<R> => {
    const params = Object.assign({ Bearer: token }, po) as P;
    return f(params);
  };

  return {
    /**
     * @deprecated
     */
    find: withBearerToken(createFetchRequestForApi(citizenFindGET, options)),
    findV2: withBearerToken(createFetchRequestForApi(findV2T, options)),
    /**
     * @deprecated
     */
    enrollCitizenIO: withBearerToken(
      createFetchRequestForApi(citizenEnrollPUT, options)
    ),
    enrollCitizenV2IO: withBearerToken(
      createFetchRequestForApi(enrollCitizenV2IOT, options)
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
    winningTransactions: withBearerToken(
      createFetchRequestForApi(winningTransactionsGET, options)
    ),
    getRanking: withBearerToken(
      createFetchRequestForApi(citizenRankingGET, options)
    )
  };
}
