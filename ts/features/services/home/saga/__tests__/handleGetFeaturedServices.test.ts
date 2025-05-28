import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { FeaturedService } from "../../../../../../definitions/services/FeaturedService";
import { FeaturedServices } from "../../../../../../definitions/services/FeaturedServices";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import { ServicesClient } from "../../../common/api/__mocks__/servicesClient";
import { featuredServicesGet } from "../../store/actions";
import { handleGetFeaturedServices } from "../handleGetFeaturedServices";

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
  describe("when the response is successful", () => {
    it(`should put ${getType(
      featuredServicesGet.success
    )} with the parsed featured services data`, () => {
      testSaga(
        handleGetFeaturedServices,
        ServicesClient.getFeaturedServices,
        featuredServicesGet.request()
      )
        .next()
        .call(
          withRefreshApiCall,
          ServicesClient.getFeaturedServices(),
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
        ServicesClient.getFeaturedServices,
        featuredServicesGet.request()
      )
        .next()
        .call(
          withRefreshApiCall,
          ServicesClient.getFeaturedServices(),
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
