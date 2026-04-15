import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { InstitutionServicesResource } from "../../../../../../definitions/services/InstitutionServicesResource";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import { ServicesClient } from "../../../common/api/__mocks__/servicesClient";
import {
  PaginatedServicesGetPayload,
  paginatedServicesGet
} from "../../store/actions";
import { handleFindInstitutionServices } from "../handleFindInstitutionServices";
import { ServiceId } from "../../../../../../definitions/services/ServiceId";

const MOCK_INSTITUTION_ID = "I01";

const DEFAULT_REQUEST_PAYLOAD: PaginatedServicesGetPayload = {
  institutionId: MOCK_INSTITUTION_ID,
  limit: 3,
  offset: 0
};

const MOCK_RESPONSE_PAYLOAD: InstitutionServicesResource = {
  services: [
    {
      id: "1" as ServiceId,
      name: "Service 1",
      version: 1
    },
    {
      id: "2" as ServiceId,
      name: "Service 2",
      version: 1
    },
    {
      id: "3" as ServiceId,
      name: "Service 3",
      version: 1
    }
  ],
  count: 23,
  limit: 3,
  offset: 0
};

describe("handleFindInstitutionServices", () => {
  describe("when the response is successful", () => {
    it(`should put ${getType(
      paginatedServicesGet.success
    )} with the parsed institutions and pagination data`, () => {
      testSaga(
        handleFindInstitutionServices,
        ServicesClient.findInstutionServices,
        paginatedServicesGet.request(DEFAULT_REQUEST_PAYLOAD)
      )
        .next()
        .call(
          withRefreshApiCall,
          ServicesClient.findInstutionServices(DEFAULT_REQUEST_PAYLOAD),
          paginatedServicesGet.request(DEFAULT_REQUEST_PAYLOAD)
        )
        .next(E.right({ status: 200, value: MOCK_RESPONSE_PAYLOAD }))
        .put(paginatedServicesGet.success(MOCK_RESPONSE_PAYLOAD))
        .next()
        .isDone();
    });
  });

  describe("when the response is an Error", () => {
    const statusCode = 500;

    it(`should put ${getType(
      paginatedServicesGet.failure
    )} with the error`, () => {
      testSaga(
        handleFindInstitutionServices,
        ServicesClient.findInstutionServices,
        paginatedServicesGet.request(DEFAULT_REQUEST_PAYLOAD)
      )
        .next()
        .call(
          withRefreshApiCall,
          ServicesClient.findInstutionServices(DEFAULT_REQUEST_PAYLOAD),
          paginatedServicesGet.request(DEFAULT_REQUEST_PAYLOAD)
        )
        .next(
          E.right({
            status: statusCode,
            value: { code: statusCode, message: "error" }
          })
        )
        .put(
          paginatedServicesGet.failure({
            id: MOCK_INSTITUTION_ID,
            kind: "generic",
            value: new Error(`response status code ${statusCode}`)
          })
        )
        .next()
        .isDone();
    });
  });
});
