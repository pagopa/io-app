import * as pot from "italia-ts-commons/lib/pot";
import { OrganizationFiscalCode } from "italia-ts-commons/lib/strings";
import { DepartmentName } from "../../../../definitions/backend/DepartmentName";
import { OrganizationName } from "../../../../definitions/backend/OrganizationName";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { ServiceName } from "../../../../definitions/backend/ServiceName";
import { ServicePublic } from "../../../../definitions/backend/ServicePublic";
import { ScopeEnum } from "../../../../definitions/content/Service";
import {
  isServiceIdInScopeSelector,
  servicesInScopeSelector,
  isServiceInScopeSelector
} from "../../../store/reducers/content";

const servicesByScope = {
  NATIONAL: ["id1", "id2", "id3"],
  LOCAL: ["id4", "id5", "id6"]
};

const services: ReadonlyArray<ServicePublic> = [
  {
    service_id: "id1" as ServiceId,
    service_name: "service1" as ServiceName,
    organization_name: "organization1" as OrganizationName,
    department_name: "department1" as DepartmentName,
    organization_fiscal_code: "organization_fc1" as OrganizationFiscalCode,
    version: 1
  },
  {
    service_id: "id2" as ServiceId,
    service_name: "service2" as ServiceName,
    organization_name: "organization2" as OrganizationName,
    department_name: "department2" as DepartmentName,
    organization_fiscal_code: "organization_fc2" as OrganizationFiscalCode,
    version: 1
  },
  {
    service_id: "id6" as ServiceId,
    service_name: "service6" as ServiceName,
    organization_name: "organization6" as OrganizationName,
    department_name: "department6" as DepartmentName,
    organization_fiscal_code: "organization_fc6" as OrganizationFiscalCode,
    version: 1
  }
];

describe("isServiceIdInScopeSelector selector", () => {
  const potServicesByScope = pot.some(servicesByScope);
  it("should return true when a service id is in scope", () => {
    expect(
      isServiceIdInScopeSelector(
        "id1" as ServiceId,
        ScopeEnum.NATIONAL
      ).resultFunc(potServicesByScope)
    ).toBeTruthy();
  });

  it("should return false when a service id is not in scope", () => {
    expect(
      isServiceIdInScopeSelector(
        "id1" as ServiceId,
        ScopeEnum.LOCAL
      ).resultFunc(potServicesByScope)
    ).toBeFalsy();
  });

  it("should return false when the pot is none", () => {
    expect(
      isServiceIdInScopeSelector(
        "id1" as ServiceId,
        ScopeEnum.NATIONAL
      ).resultFunc(pot.none)
    ).toBeFalsy();
  });

  it("should return true if the service is in scope", () => {
    expect(
      isServiceInScopeSelector(services[0], ScopeEnum.NATIONAL).resultFunc(
        potServicesByScope
      )
    ).toBeTruthy();
  });

  it("should return the services in the specified scope", () => {
    expect(
      servicesInScopeSelector(services, ScopeEnum.NATIONAL).resultFunc(
        potServicesByScope
      )
    ).toStrictEqual([services[0], services[1]]);
  });
});
