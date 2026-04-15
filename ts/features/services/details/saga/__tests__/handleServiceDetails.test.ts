import * as E from "fp-ts/lib/Either";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { testSaga } from "redux-saga-test-plan";
import { OrganizationName } from "../../../../../../definitions/backend/OrganizationName";
import { ServiceDetails } from "../../../../../../definitions/services/ServiceDetails";
import { StandardServiceCategoryEnum } from "../../../../../../definitions/services/StandardServiceCategory";
import { ScopeTypeEnum } from "../../../../../../definitions/services/ScopeType";
import { ServiceId } from "../../../../../../definitions/services/ServiceId";
import { loadServiceDetail } from "../../store/actions/details";
import { handleServiceDetails } from "../handleServiceDetails";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import { ServicesClient } from "../../../common/api/__mocks__/servicesClient";

const mockedServiceId = "A01" as ServiceId;

export const mockedService: ServiceDetails = {
  id: mockedServiceId,
  description: "description",
  metadata: {
    category: StandardServiceCategoryEnum.STANDARD,
    scope: ScopeTypeEnum.NATIONAL
  },
  name: "servizio1",
  organization: {
    fiscal_code: "OrgFiscalCode" as OrganizationFiscalCode,
    name: "OrgName" as OrganizationName
  }
};
const mockedGenericError = new Error(`response status 500`);

describe("handleServiceDetails", () => {
  it("returns an error if backend response is 500", () => {
    testSaga(
      handleServiceDetails,
      ServicesClient.getServiceById,
      loadServiceDetail.request(mockedServiceId)
    )
      .next()
      .call(
        withRefreshApiCall,
        ServicesClient.getServiceById({ service_id: mockedServiceId }),
        loadServiceDetail.request(mockedServiceId)
      )
      .next(E.right({ status: 500, value: "generic error" }))
      .put(
        loadServiceDetail.failure({
          service_id: mockedServiceId,
          error: mockedGenericError
        })
      )
      .next()
      .isDone();
  });

  it("returns service detail if the backend response is 200", () => {
    testSaga(
      handleServiceDetails,
      ServicesClient.getServiceById,
      loadServiceDetail.request(mockedServiceId)
    )
      .next()
      .call(
        withRefreshApiCall,
        ServicesClient.getServiceById({ service_id: mockedServiceId }),
        loadServiceDetail.request(mockedServiceId)
      )
      .next(E.right({ status: 200, value: mockedService }))
      .put(loadServiceDetail.success(mockedService))
      .next()
      .isDone();
  });
});
