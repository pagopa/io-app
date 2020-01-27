import * as pot from "italia-ts-commons/lib/pot";
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { testSaga } from "redux-saga-test-plan";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { updateOrganizations } from "../../../store/actions/organizations";
import {
  organizationNamesByFiscalCodeSelector,
  OrganizationNamesByFiscalCodeState
} from "../../../store/reducers/entities/organizations/organizationsByFiscalCodeReducer";
import { visibleServicesSelector } from "../../../store/reducers/entities/services/visibleServices";
import { mockedService } from "../../startup/__tests__/loadServiceDetailRequestHandler.test";
import { handleOrganizationNameUpdateSaga } from "../handleOrganizationNameUpdateSaga";

const mockedOrganizationsNameByFiscalCode: OrganizationNamesByFiscalCodeState = {
  ["01"]: "ente1" as NonEmptyString,
  ["02"]: "ente2" as NonEmptyString,
  ["03"]: "ente3" as NonEmptyString
};

const mockedOrganizationsNameByFiscalCodeUpdated: OrganizationNamesByFiscalCodeState = {
  ["01"]: "ente1 - nuovo nome" as NonEmptyString,
  ["02"]: "ente2" as NonEmptyString,
  ["03"]: "ente3" as NonEmptyString
};

const mockedVisibleServices = pot.some([
  { service_id: "A01" as ServiceId, version: 1 },
  { service_id: "A02" as ServiceId, version: 5 },
  { service_id: "A03" as ServiceId, version: 2 }
]);

describe("handleOrganizationNameUpdateSaga", () => {
  it("does nothing if the organizationNamesByFiscalCodeSelector return undefined", () => {
    testSaga(handleOrganizationNameUpdateSaga, mockedService)
      .next()
      .select(organizationNamesByFiscalCodeSelector)
      .next(undefined)
      .isDone();
  });

  it("does nothing after service detail load if the related organization name exist in the organizations redux store", () => {
    testSaga(handleOrganizationNameUpdateSaga, mockedService)
      .next()
      .select(organizationNamesByFiscalCodeSelector)
      .next(mockedOrganizationsNameByFiscalCodeUpdated)
      .select(visibleServicesSelector)
      .next(mockedVisibleServices)
      .isDone();
  });

  it("add the organization name of the loaded service detail if the related fiscal code does NOT exist in the organizations redux state", () => {
    testSaga(handleOrganizationNameUpdateSaga, mockedService)
      .next()
      .select(organizationNamesByFiscalCodeSelector)
      .next({})
      .put(updateOrganizations(mockedService))
      .next()
      .isDone();
  });

  it("add the organization name of the loaded service detail if the related fiscal code exists in the organizations redux state related to a different name", () => {
    testSaga(handleOrganizationNameUpdateSaga, mockedService)
      .next()
      .select(organizationNamesByFiscalCodeSelector)
      .next(mockedOrganizationsNameByFiscalCode)
      .select(visibleServicesSelector)
      .next(mockedVisibleServices)
      .put(updateOrganizations(mockedService))
      .next()
      .isDone();
  });
});
