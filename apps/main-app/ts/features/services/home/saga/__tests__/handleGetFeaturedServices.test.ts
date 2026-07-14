import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";

import { FeaturedService } from "../../../../../../definitions/services/FeaturedService";
import { FeaturedServices } from "../../../../../../definitions/services/FeaturedServices";
import { servicesClientManager } from "../../../../../api/ServicesClientManager";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import { featuredServicesGet } from "../../store/actions";
import { handleGetFeaturedServices } from "../handleGetFeaturedServices";

jest.mock("../../../../../api/ServicesClientManager");

const MOCK_RESPONSE_PAYLOAD: FeaturedServices = {
  services: [
    {
      id: "aServiceId1",
      name: "Service Name 1",
      version: 1
    } as FeaturedService,
    {
      id: "aServiceId2",
      name: "Service Name 2",
      version: 1
    } as FeaturedService,
    {
      id: "aServiceId3",
      name: "Service Name 3",
      version: 1,
      organization_name: "Organization Name"
    } as FeaturedService
  ]
};

describe("handleGetFeaturedServices", () => {
  const servicesClient = servicesClientManager.getClient("https://base.url", {
    token: "mock-bearer-token"
  });
  describe("when the response is successful", () => {
    it(`should put ${getType(
      featuredServicesGet.success
    )} with the parsed featured services data`, () => {
      testSaga(
        handleGetFeaturedServices,
        servicesClient.getFeaturedServices,
        featuredServicesGet.request()
      )
        .next()
        .call(
          withRefreshApiCall,
          servicesClient.getFeaturedServices({}),
          featuredServicesGet.request()
        )
        .next(E.right({ status: 200, value: MOCK_RESPONSE_PAYLOAD }))
        .put(featuredServicesGet.success(MOCK_RESPONSE_PAYLOAD))
        .next()
        .isDone();
    });
  });

  describe("when the response is an Error", () => {
    const statusCode = 500;

    it(`should put ${getType(
      featuredServicesGet.failure
    )} with the error`, () => {
      testSaga(
        handleGetFeaturedServices,
        servicesClient.getFeaturedServices,
        featuredServicesGet.request()
      )
        .next()
        .call(
          withRefreshApiCall,
          servicesClient.getFeaturedServices({}),
          featuredServicesGet.request()
        )
        .next(
          E.right({
            status: statusCode,
            value: { code: statusCode, message: "error" }
          })
        )
        .put(
          featuredServicesGet.failure({
            kind: "generic",
            value: new Error(`response status code ${statusCode}`)
          })
        )
        .next()
        .isDone();
    });
  });
});
