import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { InstitutionServicesResource } from "../../../../../../definitions/services/InstitutionServicesResource";
import { withRefreshApiCall } from "../../../../fastLogin/saga/utils";
import { ServicesClient } from "../../../common/api/__mocks__/client";
import {
  PaginatedServicesGetPayload,
  paginatedServicesGet
} from "../../store/actions";
import { handleFindServices } from "../handleFindServices";

const DEFAULT_REQUEST_PAYLOAD: PaginatedServicesGetPayload = {
  institutionId: "1",
  limit: 3,
  offset: 0
};

const MOCK_RESPONSE_PAYLOAD: InstitutionServicesResource = {
  services: [
    {
      id: "1",
      name: "Service 1",
      version: 1
    },
    {
      id: "2",
      name: "Service 2",
      version: 1
    },
    {
      id: "3",
      name: "Service 3",
      version: 1
    }
  ],
  count: 23,
  limit: 3,
  offset: 0
};

describe("handleFindServices", () => {
  describe("when the response is successful", () => {
    it(`should put ${getType(
      paginatedServicesGet.success
    )} with the parsed institutions and pagination data`, () => {
      testSaga(
        handleFindServices,
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
        handleFindServices,
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
            kind: "generic",
            value: new Error(`response status code ${statusCode}`)
          })
        )
        .next()
        .isDone();
    });
  });
});
