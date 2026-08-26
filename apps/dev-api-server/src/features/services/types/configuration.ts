import { WithinRangeNumber } from "@pagopa/ts-commons/lib/numbers";
import * as t from "io-ts";

import { HttpResponseCode } from "../../../types/httpResponseCode";

export const ServiceConfiguration = t.type({
  // configure number of featured institutions
  featuredInstitutionsSize: WithinRangeNumber(0, 6),
  // configure number of featured services
  featuredServicesSize: WithinRangeNumber(0, 6),
  // configure some API response error code
  response: t.type({
    // 200 success with payload
    featuredInstitutionsResponseCode: HttpResponseCode,
    // 200 success with payload
    featuredServicesResponseCode: HttpResponseCode,
    // 200 success with payload
    institutionsResponseCode: HttpResponseCode,
    // 200 success with payload
    servicesByInstitutionIdResponseCode: HttpResponseCode,
    // 200 success with payload
    serviceByIdResponseCode: HttpResponseCode
  })
});

export type ServiceConfiguration = t.TypeOf<typeof ServiceConfiguration>;
