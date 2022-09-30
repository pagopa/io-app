import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { appReducer } from "../../../index";
import {
  loadServiceDetailNotFound,
  markServiceAsRead,
  showServiceDetails
} from "../../../../actions/services";
import { ServicePublic } from "../../../../../../definitions/backend/ServicePublic";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { ServiceName } from "../../../../../../definitions/backend/ServiceName";
import { NotificationChannelEnum } from "../../../../../../definitions/backend/NotificationChannel";
import { OrganizationName } from "../../../../../../definitions/backend/OrganizationName";
import { DepartmentName } from "../../../../../../definitions/backend/DepartmentName";

const mockService: ServicePublic = {
  department_name: "dev department name" as DepartmentName,
  organization_fiscal_code: "00000000001" as OrganizationFiscalCode,
  organization_name: "Ramella, Zanetti and Maggiani [1]" as OrganizationName,
  service_id: "id1" as ServiceId,
  service_name: "reinventate next-generation architetture" as ServiceName,
  available_notification_channels: [NotificationChannelEnum.EMAIL],
  version: 1
};

describe("readServicesByIdReducer", () => {
  it("should be read", () => {
    const state = appReducer(undefined, showServiceDetails(mockService));
    expect(state.entities.services.readState.id1).toBeTruthy();
  });

  it("should be read", () => {
    const state = appReducer(undefined, markServiceAsRead("id2" as ServiceId));
    expect(state.entities.services.readState.id2).toBeTruthy();
  });

  it("should be undefined", () => {
    const state = appReducer(undefined, showServiceDetails(mockService));
    expect(state.entities.services.readState.id3).toBeUndefined();
  });

  it("should remove a specific not found service read state", () => {
    const state1 = appReducer(undefined, markServiceAsRead("id1" as ServiceId));
    const state2 = appReducer(state1, markServiceAsRead("id2" as ServiceId));
    expect(state2.entities.services.readState.id1).toBeTruthy();
    expect(state2.entities.services.readState.id2).toBeTruthy();
    const updateState = appReducer(
      state2,
      loadServiceDetailNotFound("id1" as ServiceId)
    );
    expect(updateState.entities.services.readState.id1).toBeUndefined();
    expect(state2.entities.services.readState.id2).toBeTruthy();
  });
});
