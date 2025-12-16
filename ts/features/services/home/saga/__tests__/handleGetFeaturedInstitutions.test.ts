import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { Institutions } from "../../../../../../definitions/services/Institutions";
import { OrganizationFiscalCode } from "../../../../../../definitions/services/OrganizationFiscalCode";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import { ServicesClient } from "../../../common/api/__mocks__/servicesClient";
import { featuredInstitutionsGet } from "../../store/actions";
import { handleGetFeaturedInstitutions } from "../handleGetFeaturedInstitutions";

const MOCK_RESPONSE_PAYLOAD: Institutions = {
  institutions: [
    {
      id: "anInstitutionId1",
      name: "Institution Name 1",
      fiscal_code: "12345678901" as OrganizationFiscalCode
    },
    {
      id: "anInstitutionId2",
      name: "Institution Name 2",
      fiscal_code: "12345678901" as OrganizationFiscalCode
    },
    {
      id: "anInstitutionId3",
      name: "Institution Name 3",
      fiscal_code: "12345678901" as OrganizationFiscalCode
    }
  ]
};

describe("handleGetFeaturedInstitutions", () => {
  describe("when the response is successful", () => {
    it(`should put ${getType(
      featuredInstitutionsGet.success
    )} with the parsed featured institutions data`, () => {
      testSaga(
        handleGetFeaturedInstitutions,
        ServicesClient.getFeaturedInstitutions,
        featuredInstitutionsGet.request()
      )
        .next()
        .call(
          withRefreshApiCall,
          ServicesClient.getFeaturedInstitutions(),
          featuredInstitutionsGet.request()
        )
        .next(E.right({ status: 200, value: MOCK_RESPONSE_PAYLOAD }))
        .put(featuredInstitutionsGet.success(MOCK_RESPONSE_PAYLOAD))
        .next()
        .isDone();
    });
  });

  describe("when the response is an Error", () => {
    const statusCode = 500;

    it(`should put ${getType(
      featuredInstitutionsGet.failure
    )} with the error`, () => {
      testSaga(
        handleGetFeaturedInstitutions,
        ServicesClient.getFeaturedInstitutions,
        featuredInstitutionsGet.request()
      )
        .next()
        .call(
          withRefreshApiCall,
          ServicesClient.getFeaturedInstitutions(),
          featuredInstitutionsGet.request()
        )
        .next(
          E.right({
            status: statusCode,
            value: { code: statusCode, message: "error" }
          })
        )
        .put(
          featuredInstitutionsGet.failure({
            kind: "generic",
            value: new Error(`response status code ${statusCode}`)
          })
        )
        .next()
        .isDone();
    });
  });
});
