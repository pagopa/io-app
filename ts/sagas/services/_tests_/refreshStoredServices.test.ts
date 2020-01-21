import { OrganizationFiscalCode } from "italia-ts-commons/lib/strings";
import { testSaga } from "redux-saga-test-plan";
import { DepartmentName } from "../../../../definitions/backend/DepartmentName";
import { OrganizationName } from "../../../../definitions/backend/OrganizationName";
import { PaginatedServiceTupleCollection } from "../../../../definitions/backend/PaginatedServiceTupleCollection";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { ServiceName } from "../../../../definitions/backend/ServiceName";
import { ServicePublic } from "../../../../definitions/backend/ServicePublic";
import { servicesByIdSelector } from "../../../store/reducers/entities/services/servicesById";
import { refreshStoredServices } from "../refreshStoredServices";

describe("refreshStoredServices", () => {
  const mockedService: ServicePublic = {
    service_id: "S01" as ServiceId,
    service_name: "servizio1" as ServiceName,
    organization_name: "ente1" as OrganizationName,
    department_name: "dipartimento1" as DepartmentName,
    organization_fiscal_code: "01" as OrganizationFiscalCode,
    version: 1
  };

  it("TO BE FIXED - loads again the services with an old version", () => {
    const mockedNewVisibleServices: PaginatedServiceTupleCollection["items"] = [
      {
        service_id: mockedService.service_id,
        version: mockedService.version + 1 // tslint:disable-line restrict-plus-operands
      }
    ];
    const mockedServicesById = { [mockedService.service_id]: mockedService };

    testSaga(refreshStoredServices, mockedNewVisibleServices)
      .next()
      .select(servicesByIdSelector)
      .next(mockedServicesById)
      // TODO: fix the function - the test should include the refresh of the visible service
      // because the service version has been incremented https://www.pivotaltracker.com/story/show/170582079
      // .all({['0']: put(loadService.request("S01"))})
      .next()
      .isDone();
  });

  it("does nothing if all the latest versions of visible services are stored", () => {
    const mockedVisibleServices: PaginatedServiceTupleCollection["items"] = [
      { service_id: mockedService.service_id, version: mockedService.version }
    ];
    const mockedServicesById = { [mockedService.service_id]: mockedService };

    testSaga(refreshStoredServices, mockedVisibleServices)
      .next()
      .select(servicesByIdSelector)
      .next(mockedServicesById)
      .next()
      .isDone();
  });
});
