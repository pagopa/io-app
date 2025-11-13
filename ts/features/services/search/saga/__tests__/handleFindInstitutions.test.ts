import { Millisecond } from "@pagopa/ts-commons/lib/units";
import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { getType } from "typesafe-actions";
import { InstitutionsResource } from "../../../../../../definitions/services/InstitutionsResource";
import { OrganizationFiscalCode } from "../../../../../../definitions/services/OrganizationFiscalCode";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import { ServicesClient } from "../../../common/api/__mocks__/client";
import {
  SearchPaginatedInstitutionsGetPayload,
  searchPaginatedInstitutionsGet
} from "../../store/actions";
import { handleFindInstitutions } from "../handleFindInstitutions";

const DEBOUNCE_SEARCH: Millisecond = 500 as Millisecond;

const DEFAULT_REQUEST_PAYLOAD: SearchPaginatedInstitutionsGetPayload = {
  limit: 3,
  offset: 0
};

const MOCK_RESPONSE_PAYLOAD: InstitutionsResource = {
  institutions: [
    {
      fiscal_code: "FRLFNC82A04D969A" as OrganizationFiscalCode,
      id: "1",
      name: "Institution 1"
    },
    {
      fiscal_code: "FRLFNC82A04D969B" as OrganizationFiscalCode,
      id: "2",
      name: "Institution 2"
    },
    {
      fiscal_code: "FRLFNC82A04D969C" as OrganizationFiscalCode,
      id: "3",
      name: "Institution 3"
    }
  ],
  count: 23,
  limit: 3,
  offset: 0
};

describe("handleFindInstitutions", () => {
  describe("when the response is successful", () => {
    it(`should put ${getType(
      searchPaginatedInstitutionsGet.success
    )} with the parsed institutions and pagination data`, () => {
      testSaga(
        handleFindInstitutions,
        ServicesClient.findInstitutions,
        searchPaginatedInstitutionsGet.request(DEFAULT_REQUEST_PAYLOAD)
      )
        .next()
        .delay(DEBOUNCE_SEARCH)
        .next()
        .call(
          withRefreshApiCall,
          ServicesClient.findInstitutions(DEFAULT_REQUEST_PAYLOAD),
          searchPaginatedInstitutionsGet.request(DEFAULT_REQUEST_PAYLOAD)
        )
        .next(E.right({ status: 200, value: MOCK_RESPONSE_PAYLOAD }))
        .put(searchPaginatedInstitutionsGet.success(MOCK_RESPONSE_PAYLOAD))
        .next()
        .isDone();
    });
  });

  describe("when the response is an Error", () => {
    const statusCode = 500;

    it(`should put ${getType(
      searchPaginatedInstitutionsGet.failure
    )} with the error`, () => {
      testSaga(
        handleFindInstitutions,
        ServicesClient.findInstitutions,
        searchPaginatedInstitutionsGet.request(DEFAULT_REQUEST_PAYLOAD)
      )
        .next()
        .delay(DEBOUNCE_SEARCH)
        .next()
        .call(
          withRefreshApiCall,
          ServicesClient.findInstitutions(DEFAULT_REQUEST_PAYLOAD),
          searchPaginatedInstitutionsGet.request(DEFAULT_REQUEST_PAYLOAD)
        )
        .next(
          E.right({
            status: statusCode,
            value: { code: statusCode, message: "error" }
          })
        )
        .put(
          searchPaginatedInstitutionsGet.failure({
            kind: "generic",
            value: new Error(`response status code ${statusCode}`)
          })
        )
        .next()
        .isDone();
    });
  });
});
