import * as t from "io-ts";

import {
  basicResponseDecoder,
  BasicResponseType,
  createFetchRequestForApi,
  IGetApiRequestType
} from "italia-ts-commons/lib/requests";
import { NonEmptyString } from "italia-ts-commons/lib/strings";

import { defaultRetryingFetch } from "../utils/fetch";

const ServiceMetadata = t.partial({
  description: NonEmptyString
});

export type ServiceMetadata = t.TypeOf<typeof ServiceMetadata>;

export type GetServiceT = IGetApiRequestType<
  {
    serviceId: string;
  },
  never,
  never,
  BasicResponseType<ServiceMetadata>
>;

export function ContentClient(fetchApi: typeof fetch = defaultRetryingFetch()) {
  const options = {
    baseUrl: "",
    fetchApi
  };

  const getServiceT: GetServiceT = {
    method: "get",
    url: params =>
      `https://raw.githubusercontent.com/teamdigitale/italia-services-metadata/services-cards/services/${
        params.serviceId
      }.json`,
    query: _ => ({}),
    headers: _ => ({}),
    response_decoder: basicResponseDecoder(ServiceMetadata)
  };

  return {
    getService: createFetchRequestForApi(getServiceT, options)
  };
}
