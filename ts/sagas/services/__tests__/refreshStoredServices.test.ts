import * as pot from "italia-ts-commons/lib/pot";
import { OrganizationFiscalCode } from "italia-ts-commons/lib/strings";
import { testSaga } from "redux-saga-test-plan";
import { put } from "redux-saga/effects";
import { DepartmentName } from "../../../../definitions/backend/DepartmentName";
import { OrganizationName } from "../../../../definitions/backend/OrganizationName";
import { PaginatedServiceTupleCollection } from "../../../../definitions/backend/PaginatedServiceTupleCollection";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { ServiceName } from "../../../../definitions/backend/ServiceName";
import { ServicePublic } from "../../../../definitions/backend/ServicePublic";
import { loadServiceDetail } from "../../../store/actions/services";
import {
  servicesByIdSelector,
  ServicesByIdState
} from "../../../store/reducers/entities/services/servicesById";
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

  it("loads again the services if it is visible and an old version is stored", () => {
    const mockedNewVisibleServices: PaginatedServiceTupleCollection["items"] = [
      { service_id: mockedService.service_id, version: 2 }
    ];
    const mockedServicesById: ServicesByIdState = {
      [mockedService.service_id]: pot.some(mockedService)
    };

    testSaga(refreshStoredServices, mockedNewVisibleServices)
      .next()
      .select(servicesByIdSelector)
      .next(mockedServicesById)
      .all([put(loadServiceDetail.request(mockedService.service_id))])
      .next()
      .isDone();
  });

  it("loads the services if it is visible and not yet stored", () => {
    const mockedNewVisibleServices: PaginatedServiceTupleCollection["items"] = [
      { service_id: mockedService.service_id, version: 1 }
    ];

    testSaga(refreshStoredServices, mockedNewVisibleServices)
      .next()
      .select(servicesByIdSelector)
      .next({})
      .all([put(loadServiceDetail.request(mockedService.service_id))])
      .next()
      .isDone();
  });

  it("does nothing if all the latest versions of visible services are stored", () => {
    const mockedVisibleServices: PaginatedServiceTupleCollection["items"] = [
      { service_id: mockedService.service_id, version: mockedService.version }
    ];
    const mockedServicesById: ServicesByIdState = {
      [mockedService.service_id]: pot.some(mockedService)
    };

    testSaga(refreshStoredServices, mockedVisibleServices)
      .next()
      .select(servicesByIdSelector)
      .next(mockedServicesById)
      .next()
      .isDone();
  });
});
