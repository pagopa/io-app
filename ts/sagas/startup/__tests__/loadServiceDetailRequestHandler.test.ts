import * as E from "fp-ts/lib/Either";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { testSaga } from "redux-saga-test-plan";
import { ActionType } from "typesafe-actions";
import { DepartmentName } from "../../../../definitions/backend/DepartmentName";
import { OrganizationName } from "../../../../definitions/backend/OrganizationName";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { ServiceName } from "../../../../definitions/backend/ServiceName";
import { ServicePublic } from "../../../../definitions/backend/ServicePublic";
import { loadServiceDetail } from "../../../store/actions/services";
import { handleOrganizationNameUpdateSaga } from "../../services/handleOrganizationNameUpdateSaga";
import { handleServiceReadabilitySaga } from "../../services/handleServiceReadabilitySaga";
import { loadServiceDetailRequestHandler } from "../loadServiceDetailRequestHandler";

const mockedServiceId = "A01" as ServiceId;
const getService = jest.fn();
const mockedAction: ActionType<typeof loadServiceDetail.request> = {
  payload: mockedServiceId,
  type: "LOAD_SERVICE_DETAIL_REQUEST"
};
export const mockedService: ServicePublic = {
  service_id: mockedServiceId,
  service_name: "servizio1" as ServiceName,
  organization_name: "ente1 - nuovo nome" as OrganizationName,
  department_name: "dipartimento1" as DepartmentName,
  organization_fiscal_code: "01" as OrganizationFiscalCode,
  version: 2
};
const mockedGenericError = new Error(`response status 500`);

describe("loadServiceDetailRequestHandler", () => {
  it("returns an error if backend response is 500", () => {
    testSaga(loadServiceDetailRequestHandler, getService, mockedAction)
      .next()
      .call(getService, { service_id: mockedServiceId })
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
    testSaga(loadServiceDetailRequestHandler, getService, mockedAction)
      .next()
      .call(getService, { service_id: mockedServiceId })
      .next(E.right({ status: 200, value: mockedService }))
      .put(loadServiceDetail.success(mockedService))
      .next()
      .call(handleServiceReadabilitySaga, mockedServiceId)
      .next()
      .call(handleOrganizationNameUpdateSaga, mockedService)
      .next()
      .isDone();
  });
});
