import { createFetchRequestForApi } from "@pagopa/ts-commons/lib/requests";
import { Omit } from "@pagopa/ts-commons/lib/types";
import {
  getStatoBeneficiarioDefaultDecoder,
  GetStatoBeneficiarioT,
  registraBeneficiarioDefaultDecoder,
  RegistraBeneficiarioT
} from "../../../../../definitions/cdc/requestTypes";
import { defaultRetryingFetch } from "../../../../utils/fetch";

/**
 * Get the list of years with the associated bonus state
 */
const GetStatoBeneficiario: GetStatoBeneficiarioT = {
  method: "get",
  url: () => "/cdc/beneficiario/stato",
  query: _ => ({}),
  headers: p => ({ Authorization: `BearerAuth ${p.BearerAuth}` }),
  response_decoder: getStatoBeneficiarioDefaultDecoder()
};

/**
 * Post the list of years for which the user wants to request the bonus
 */
const PostRegistraBeneficiario: RegistraBeneficiarioT = {
  method: "post",
  url: () => "/cdc/beneficiario/registrazione",
  query: _ => ({}),
  body: ({ body }) => JSON.stringify(body),
  headers: p => ({
    Authorization: `BearerAuth ${p.BearerAuth}`,
    "Content-Type": "application/json"
  }),
  response_decoder: registraBeneficiarioDefaultDecoder()
};

const withCdcToken =
  (token: string) =>
  <P extends { BearerAuth: string }, R>(f: (p: P) => Promise<R>) =>
  async (po: Omit<P, "BearerAuth">): Promise<R> => {
    const params = Object.assign({ BearerAuth: String(token) }, po) as P;
    return f(params);
  };

// client for Cdc to handle API communications
export const BackendCdcClient = (
  baseUrl: string,
  token: string,
  fetchApi: typeof fetch = defaultRetryingFetch()
) => {
  const options = {
    baseUrl,
    fetchApi
  };

  const withToken = withCdcToken(token);

  return {
    getStatoBeneficiario: withToken(
      createFetchRequestForApi(GetStatoBeneficiario, options)
    ),
    postRegistraBeneficiario: withToken(
      createFetchRequestForApi(PostRegistraBeneficiario, options)
    )
  };
};

export type BackendCdcClient = ReturnType<typeof BackendCdcClient>;
