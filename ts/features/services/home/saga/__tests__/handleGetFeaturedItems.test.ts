import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { FeaturedItems } from "../../../../../../definitions/services/FeaturedItems";
import { FeaturedService } from "../../../../../../definitions/services/FeaturedService";
import { Institution } from "../../../../../../definitions/services/Institution";
import { OrganizationFiscalCode } from "../../../../../../definitions/services/OrganizationFiscalCode";
import { withRefreshApiCall } from "../../../../fastLogin/saga/utils";
import { ServicesClient } from "../../../common/api/__mocks__/client";
import { featuredItemsGet } from "../../store/actions";
import { handleGetFeaturedItems } from "../handleGetFeaturedItems";

const MOCK_RESPONSE_PAYLOAD: FeaturedItems = {
  items: [
    {
      id: "aServiceId1",
      name: "Service Name 1",
      version: 1
    } as FeaturedService,
    {
      id: "anInstitutionId1",
      name: "Institution Name 1",
      fiscal_code: "12345678901" as OrganizationFiscalCode
    } as Institution,
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
    } as FeaturedService,
    {
      id: "aServiceId4",
      name: "Service Name 4",
      version: 1
    } as FeaturedService
  ]
};

describe("handleGetFeaturedItems", () => {
  describe("when the response is successful", () => {
    it(`should put ${getType(
      featuredItemsGet.success
    )} with the parsed featured items data`, () => {
      testSaga(
        handleGetFeaturedItems,
        ServicesClient.getFeaturedItems,
        featuredItemsGet.request()
      )
        .next()
        .call(
          withRefreshApiCall,
          ServicesClient.getFeaturedItems(),
          featuredItemsGet.request()
        )
        .next(E.right({ status: 200, value: MOCK_RESPONSE_PAYLOAD }))
        .put(featuredItemsGet.success(MOCK_RESPONSE_PAYLOAD))
        .next()
        .isDone();
    });
  });

  describe("when the response is an Error", () => {
    const statusCode = 500;

    it(`should put ${getType(featuredItemsGet.failure)} with the error`, () => {
      testSaga(
        handleGetFeaturedItems,
        ServicesClient.getFeaturedItems,
        featuredItemsGet.request()
      )
        .next()
        .call(
          withRefreshApiCall,
          ServicesClient.getFeaturedItems(),
          featuredItemsGet.request()
        )
        .next(
          E.right({
            status: statusCode,
            value: { code: statusCode, message: "error" }
          })
        )
        .put(
          featuredItemsGet.failure({
            kind: "generic",
            value: new Error(`response status code ${statusCode}`)
          })
        )
        .next()
        .isDone();
    });
  });
});
