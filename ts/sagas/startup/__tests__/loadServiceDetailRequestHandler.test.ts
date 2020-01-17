import { right } from "fp-ts/lib/Either";
import * as pot from "italia-ts-commons/lib/pot";
import {
  NonEmptyString,
  OrganizationFiscalCode
} from "italia-ts-commons/lib/strings";
import { testSaga } from "redux-saga-test-plan";
import { DepartmentName } from "../../../../definitions/backend/DepartmentName";
import { OrganizationName } from "../../../../definitions/backend/OrganizationName";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { ServiceName } from "../../../../definitions/backend/ServiceName";
import { ServicePublic } from "../../../../definitions/backend/ServicePublic";
import { updateOrganizations } from "../../../store/actions/organizations";
import { loadServiceDetail } from "../../../store/actions/services";
import {
  organizationNamesByFiscalCodeSelector,
  OrganizationNamesByFiscalCodeState
} from "../../../store/reducers/entities/organizations/organizationsByFiscalCodeReducer";
import { visibleServicesSelector } from "../../../store/reducers/entities/services/visibleServices";
import { handleServiceReadabilitySaga } from "../../services/services";
import { loadServiceDetailRequestHandler } from "../loadServiceDetailRequestHandler";

const mockedServiceId = "A01" as ServiceId;
const getService = jest.fn();
const mockedAction = {
  type: loadServiceDetail.request,
  payload: mockedServiceId
};
const mockedService: ServicePublic = {
  service_id: mockedServiceId,
  service_name: "servizio1" as ServiceName,
  organization_name: "ente1 - nuovo nome" as OrganizationName,
  department_name: "dipartimento1" as DepartmentName,
  organization_fiscal_code: "01" as OrganizationFiscalCode,
  version: 2
};
const mockedGenericError = new Error(`response status 500`);

const mockedVisibleServices = pot.some([
  { service_id: "A01" as ServiceId, version: 1 },
  { service_id: "A02" as ServiceId, version: 5 },
  { service_id: "A03" as ServiceId, version: 2 }
]);

describe("loadServiceDetailRequestHandler", () => {
  it("returns an error if backend response is 500", () => {
    testSaga(loadServiceDetailRequestHandler, getService, mockedAction)
      .next()
      .call(getService, { service_id: mockedServiceId })
      .next(right({ status: 500, value: "generic error" }))
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
      .next(right({ status: 200, value: mockedService }))
      .put(loadServiceDetail.success(mockedService))
      .next();
  });

  it("add the organization name of the loaded service detail if the related fiscal code does not exist in the organizations redux state", () => {
    testSaga(loadServiceDetailRequestHandler, getService, mockedAction)
      .next()
      .call(getService, { service_id: mockedServiceId })
      .next(right({ status: 200, value: mockedService }))
      .put(loadServiceDetail.success(mockedService))
      .next()
      .call(handleServiceReadabilitySaga, mockedServiceId)
      .next()
      .select(organizationNamesByFiscalCodeSelector)
      .next({})
      .select(visibleServicesSelector)
      .next(mockedVisibleServices)
      .put(updateOrganizations(mockedService))
      .next()
      .isDone();
  });

  it("add the organization name of the loaded service detail if the related fiscal code exists in the organizations redux state related to a different name", () => {
    const mockedOrganizationsNameByFiscalCode: OrganizationNamesByFiscalCodeState = {
      ["01"]: "ente1" as NonEmptyString,
      ["02"]: "ente2" as NonEmptyString,
      ["03"]: "ente3" as NonEmptyString
    };

    testSaga(loadServiceDetailRequestHandler, getService, mockedAction)
      .next()
      .call(getService, { service_id: mockedServiceId })
      .next(right({ status: 200, value: mockedService }))
      .put(loadServiceDetail.success(mockedService))
      .next()
      .call(handleServiceReadabilitySaga, mockedServiceId)
      .next()
      .select(organizationNamesByFiscalCodeSelector)
      .next(mockedOrganizationsNameByFiscalCode)
      .select(visibleServicesSelector)
      .next(mockedVisibleServices)
      .put(updateOrganizations(mockedService))
      .next()
      .isDone();
  });

  it("does nothing after service detail load if the related organization name exist in the organizations redux store", () => {
    const mockedOrganizationsNameByFiscalCode: OrganizationNamesByFiscalCodeState = {
      ["01"]: "ente1 - nuovo nome" as NonEmptyString,
      ["02"]: "ente2" as NonEmptyString,
      ["03"]: "ente3" as NonEmptyString
    };

    testSaga(loadServiceDetailRequestHandler, getService, mockedAction)
      .next()
      .call(getService, { service_id: mockedServiceId })
      .next(right({ status: 200, value: mockedService }))
      .put(loadServiceDetail.success(mockedService))
      .next()
      .call(handleServiceReadabilitySaga, mockedServiceId)
      .next()
      .select(organizationNamesByFiscalCodeSelector)
      .next(mockedOrganizationsNameByFiscalCode)
      .select(visibleServicesSelector)
      .next(mockedVisibleServices)
      .isDone();
  });
});
