import { OrganizationFiscalCode } from "@io-app/api-types/generated/definitions/services/OrganizationFiscalCode";
import { ServiceDetails } from "@io-app/api-types/generated/definitions/services/ServiceDetails";
import { ServiceId } from "@io-app/api-types/generated/definitions/services/ServiceId";
import { ServiceMetadata } from "@io-app/api-types/generated/definitions/services/ServiceMetadata";
import { fireEvent } from "@testing-library/react-native";
import { Linking, Platform } from "react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { reproduceSequence } from "../../../../../utils/tests";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as analytics from "../../../common/analytics";
import { SERVICES_ROUTES } from "../../../common/navigation/routes";
import { ServiceContactField } from "../../../common/utils/serviceContactMap";
import { loadServiceDetail } from "../../store/actions/details";
import { ServiceDetailsMetadata } from "../ServiceDetailsMetadata";

jest.mock("../../../common/analytics", () => ({
  trackServiceDetailsUserExit: jest.fn()
}));

const serviceId = "serviceWithMetadata" as ServiceId;
const organizationFiscalCode = "FSCLCD";

const service = {
  id: serviceId,
  name: "health",
  organization: {
    fiscal_code: organizationFiscalCode as OrganizationFiscalCode,
    name: "Ċentru tas-Saħħa"
  }
} as ServiceDetails;

const metadata = {
  app_android: "https://example.com/android",
  app_ios: "https://example.com/ios",
  email: "test@example.com",
  pec: "test@pec.example.com",
  phone: "+393331234567",
  support_url: "https://example.com/support",
  web_url: "https://example.com"
} as ServiceMetadata;

const contactTestID = (field: ServiceContactField) =>
  `service-details-metadata-${field}`;

describe("ServiceDetailsMetadata", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
  });

  // Restores both the `Linking.openURL` spy and the replaced `Platform.OS`
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each<{ field: ServiceContactField; name: string; url: string }>([
    { name: "website", field: "web_url", url: "https://example.com" },
    {
      name: "support",
      field: "support_url",
      url: "https://example.com/support"
    },
    { name: "phone", field: "phone", url: "tel:+393331234567" },
    { name: "email", field: "email", url: "mailto:test@example.com" },
    { name: "PEC", field: "pec", url: "mailto:test@pec.example.com" }
  ])(
    "should track the exit and open the $name contact on press",
    ({ field, url }) => {
      const { getByTestId } = renderComponent(metadata);

      fireEvent.press(getByTestId(contactTestID(field)));

      expect(analytics.trackServiceDetailsUserExit).toHaveBeenCalledTimes(1);
      expect(analytics.trackServiceDetailsUserExit).toHaveBeenCalledWith({
        link: field,
        service_id: serviceId
      });
      expect(Linking.openURL).toHaveBeenCalledTimes(1);
      expect(Linking.openURL).toHaveBeenCalledWith(url);
    }
  );

  it.each<{
    field: ServiceContactField;
    os: typeof Platform.OS;
    otherField: ServiceContactField;
    url: string;
  }>([
    {
      os: "android",
      field: "app_android",
      otherField: "app_ios",
      url: "https://example.com/android"
    },
    {
      os: "ios",
      field: "app_ios",
      otherField: "app_android",
      url: "https://example.com/ios"
    }
  ])(
    "should show only the $os app, track the exit and open it on press",
    ({ field, os, otherField, url }) => {
      jest.replaceProperty(Platform, "OS", os);
      const { getByTestId, queryByTestId } = renderComponent(metadata);

      expect(queryByTestId(contactTestID(otherField))).toBeNull();
      fireEvent.press(getByTestId(contactTestID(field)));

      expect(analytics.trackServiceDetailsUserExit).toHaveBeenCalledWith({
        link: field,
        service_id: serviceId
      });
      expect(Linking.openURL).toHaveBeenCalledWith(url);
    }
  );

  it("should not show contacts missing from the service metadata", () => {
    const { queryByTestId } = renderComponent({
      phone: "+393331234567"
    } as ServiceMetadata);

    expect(queryByTestId(contactTestID("phone"))).toBeTruthy();
    (
      [
        "web_url",
        "app_android",
        "app_ios",
        "support_url",
        "email",
        "pec"
      ] satisfies ReadonlyArray<ServiceContactField>
    ).forEach(field => expect(queryByTestId(contactTestID(field))).toBeNull());
  });
});

const renderComponent = (serviceMetadata: ServiceMetadata) => {
  const state = reproduceSequence({} as GlobalState, appReducer, [
    applicationChangeState("active"),
    loadServiceDetail.success({ ...service, metadata: serviceMetadata })
  ]);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ServiceDetailsMetadata
        organizationFiscalCode={organizationFiscalCode}
        serviceId={serviceId}
      />
    ),
    SERVICES_ROUTES.SERVICE_DETAIL,
    {},
    createStore(appReducer, state as any)
  );
};
