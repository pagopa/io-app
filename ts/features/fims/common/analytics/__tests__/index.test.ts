/* eslint-disable sonarjs/cognitive-complexity */
import {
  computeAndTrackDataShare,
  computeAndTrackDataShareAccepted,
  trackAuthenticationError,
  trackAuthenticationStart,
  trackDataShare,
  trackDataShareAccepted,
  trackExportHistory,
  trackExportSucceeded,
  trackHistoryFailure,
  trackHistoryScreen,
  trackInAppBrowserOpening
} from "..";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { ServiceDetails } from "../../../../../../definitions/services/ServiceDetails";
import * as mixpanel from "../../../../../mixpanel";
import { GlobalState } from "../../../../../store/reducers/types";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";
import * as serviceSelectors from "../../../../services/details/store/selectors";
import * as fimsAuthenticationSelectors from "../../../singleSignOn/store/selectors";

const referenceCtaLabel = "cta label";
const ctaLabels = [undefined, referenceCtaLabel];
const organizationFiscalCodes = [undefined, "organization fiscal code"];
const organizationNames = [undefined, "organization name"];
const referenceReason = "The reason";
const referenceServiceId = "01J9RSWBB4VSHVRJSY33XGA6YH" as ServiceId;
const serviceNames = [undefined, "service name"];
const ephemeralSessionsOniOS = [true, false];

describe("trackAuthenticationStart", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  organizationFiscalCodes.forEach(organizationFiscalCode =>
    organizationNames.forEach(organizationName =>
      serviceNames.forEach(serviceName =>
        ephemeralSessionsOniOS.forEach(ephemeralSessionOniOS =>
          it(`should match event name, and expected parameters for ${
            organizationFiscalCode ? "defined   " : "undefined "
          } organization fiscal code, ${
            organizationName ? "defined   " : "undefined "
          } organization name, ${
            serviceName ? "defined   " : "undefined "
          } service name, ephemeralSessionOniOS: ${ephemeralSessionOniOS}`, () => {
            const source = MESSAGES_ROUTES.MESSAGE_DETAIL;
            const mixpanelTrackMock = generateMixpanelTrackMock();
            void trackAuthenticationStart(
              referenceServiceId,
              serviceName,
              organizationName,
              organizationFiscalCode,
              referenceCtaLabel,
              source,
              ephemeralSessionOniOS
            );
            expect(mixpanelTrackMock.mock.calls.length).toBe(1);
            expect(mixpanelTrackMock.mock.calls[0].length).toBe(2);
            expect(mixpanelTrackMock.mock.calls[0][0]).toBe("FIMS_START");
            expect(mixpanelTrackMock.mock.calls[0][1]).toEqual({
              event_category: "UX",
              event_type: "action",
              fims_label: referenceCtaLabel,
              organization_fiscal_code: organizationFiscalCode,
              organization_name: organizationName,
              service_id: referenceServiceId,
              service_name: serviceName,
              source,
              ephemeralSessionOniOS
            });
          })
        )
      )
    )
  );
});

describe("trackDataShare", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  organizationFiscalCodes.forEach(organizationFiscalCode =>
    organizationNames.forEach(organizationName =>
      serviceNames.forEach(serviceName =>
        it(`should match event name, and expected parameters for ${
          organizationFiscalCode ? "defined   " : "undefined "
        } organization fiscal code, ${
          organizationName ? "defined   " : "undefined "
        } organization name, ${
          serviceName ? "defined   " : "undefined "
        } service name`, () => {
          const mixpanelTrackMock = generateMixpanelTrackMock();

          void trackDataShare(
            referenceServiceId,
            serviceName,
            organizationName,
            organizationFiscalCode,
            referenceCtaLabel
          );

          expect(mixpanelTrackMock.mock.calls.length).toBe(1);
          expect(mixpanelTrackMock.mock.calls[0].length).toBe(2);
          expect(mixpanelTrackMock.mock.calls[0][0]).toBe("FIMS_DATA_SHARE");
          expect(mixpanelTrackMock.mock.calls[0][1]).toEqual({
            event_category: "UX",
            event_type: "screen_view",
            fims_label: referenceCtaLabel,
            organization_fiscal_code: organizationFiscalCode,
            organization_name: organizationName,
            service_id: referenceServiceId,
            service_name: serviceName
          });
        })
      )
    )
  );
});

describe("trackDataShareAccepted", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  organizationFiscalCodes.forEach(organizationFiscalCode =>
    organizationNames.forEach(organizationName =>
      serviceNames.forEach(serviceName =>
        ctaLabels.forEach(ctaLabel => {
          it(`should match event name, and expected parameters for ${
            organizationFiscalCode ? "defined   " : "undefined "
          } organization fiscal code, ${
            organizationName ? "defined   " : "undefined "
          } organization name, ${
            serviceName ? "defined   " : "undefined "
          } service name, ${
            ctaLabel ? "defined   " : "undefined "
          } cta label`, () => {
            const mixpanelTrackMock = generateMixpanelTrackMock();

            void trackDataShareAccepted(
              referenceServiceId,
              serviceName,
              organizationName,
              organizationFiscalCode,
              ctaLabel
            );

            expect(mixpanelTrackMock.mock.calls.length).toBe(1);
            expect(mixpanelTrackMock.mock.calls[0].length).toBe(2);
            expect(mixpanelTrackMock.mock.calls[0][0]).toBe(
              "FIMS_DATA_SHARE_ACCEPTED"
            );
            expect(mixpanelTrackMock.mock.calls[0][1]).toEqual({
              event_category: "UX",
              event_type: "action",
              fims_label: ctaLabel,
              organization_fiscal_code: organizationFiscalCode,
              organization_name: organizationName,
              service_id: referenceServiceId,
              service_name: serviceName
            });
          });
        })
      )
    )
  );
});

describe("trackInAppBrowserOpening", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  organizationFiscalCodes.forEach(organizationFiscalCode =>
    organizationNames.forEach(organizationName =>
      serviceNames.forEach(serviceName =>
        ctaLabels.forEach(ctaLabel => {
          it(`should match event name, and expected parameters for ${
            organizationFiscalCode ? "defined   " : "undefined "
          } organization fiscal code, ${
            organizationName ? "defined   " : "undefined "
          } organization name, ${
            serviceName ? "defined   " : "undefined "
          } service name, ${
            ctaLabel ? "defined   " : "undefined "
          } cta label`, () => {
            const mixpanelTrackMock = generateMixpanelTrackMock();

            void trackInAppBrowserOpening(
              referenceServiceId,
              serviceName,
              organizationName,
              organizationFiscalCode,
              ctaLabel
            );

            expect(mixpanelTrackMock.mock.calls.length).toBe(1);
            expect(mixpanelTrackMock.mock.calls[0].length).toBe(2);
            expect(mixpanelTrackMock.mock.calls[0][0]).toBe("FIMS_CALLBACK_RP");
            expect(mixpanelTrackMock.mock.calls[0][1]).toEqual({
              event_category: "TECH",
              event_type: undefined,
              fims_label: ctaLabel,
              organization_fiscal_code: organizationFiscalCode,
              organization_name: organizationName,
              service_id: referenceServiceId,
              service_name: serviceName
            });
          });
        })
      )
    )
  );
});

describe("trackAuthenticationError", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  [undefined, referenceServiceId].forEach(serviceId =>
    organizationFiscalCodes.forEach(organizationFiscalCode =>
      organizationNames.forEach(organizationName =>
        serviceNames.forEach(serviceName => {
          it(`should match event name, and expected parameters for ${
            serviceId ? "defined   " : "undefined "
          } service Id, ${
            organizationFiscalCode ? "defined   " : "undefined "
          } organization fiscal code, ${
            organizationName ? "defined   " : "undefined "
          } organization name, ${
            serviceName ? "defined   " : "undefined "
          } service name`, () => {
            const mixpanelTrackMock = generateMixpanelTrackMock();

            void trackAuthenticationError(
              serviceId,
              serviceName,
              organizationName,
              organizationFiscalCode,
              referenceReason
            );

            expect(mixpanelTrackMock.mock.calls.length).toBe(1);
            expect(mixpanelTrackMock.mock.calls[0].length).toBe(2);
            expect(mixpanelTrackMock.mock.calls[0][0]).toBe("FIMS_ERROR");
            expect(mixpanelTrackMock.mock.calls[0][1]).toEqual({
              event_category: "KO",
              event_type: "error",
              organization_fiscal_code: organizationFiscalCode,
              organization_name: organizationName,
              service_id: serviceId,
              service_name: serviceName,
              reason: referenceReason
            });
          });
        })
      )
    )
  );
});

describe("trackHistoryScreen", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  it(`should match event name, and expected parameters`, () => {
    const mixpanelTrackMock = generateMixpanelTrackMock();

    void trackHistoryScreen();

    expect(mixpanelTrackMock.mock.calls.length).toBe(1);
    expect(mixpanelTrackMock.mock.calls[0].length).toBe(2);
    expect(mixpanelTrackMock.mock.calls[0][0]).toBe("SETTINGS_3P_ACCESS_LOG");
    expect(mixpanelTrackMock.mock.calls[0][1]).toEqual({
      event_category: "UX",
      event_type: "screen_view"
    });
  });
});

describe("trackExportHistory", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  it(`should match event name, and expected parameters`, () => {
    const mixpanelTrackMock = generateMixpanelTrackMock();

    void trackExportHistory();

    expect(mixpanelTrackMock.mock.calls.length).toBe(1);
    expect(mixpanelTrackMock.mock.calls[0].length).toBe(2);
    expect(mixpanelTrackMock.mock.calls[0][0]).toBe(
      "SETTINGS_3P_ACCESS_LOG_REQUEST"
    );
    expect(mixpanelTrackMock.mock.calls[0][1]).toEqual({
      event_category: "UX",
      event_type: "action"
    });
  });
});

describe("trackExportSucceeded", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  it(`should match event name, and expected parameters`, () => {
    const mixpanelTrackMock = generateMixpanelTrackMock();

    void trackExportSucceeded();

    expect(mixpanelTrackMock.mock.calls.length).toBe(1);
    expect(mixpanelTrackMock.mock.calls[0].length).toBe(2);
    expect(mixpanelTrackMock.mock.calls[0][0]).toBe(
      "SETTINGS_3P_ACCESS_LOG_REQUEST_SUCCESS"
    );
    expect(mixpanelTrackMock.mock.calls[0][1]).toEqual({
      event_category: "UX",
      event_type: "confirm"
    });
  });
});

describe("trackHistoryFailure", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  it(`should match event name, and expected parameters`, () => {
    const mixpanelTrackMock = generateMixpanelTrackMock();

    void trackHistoryFailure(referenceReason);

    expect(mixpanelTrackMock.mock.calls.length).toBe(1);
    expect(mixpanelTrackMock.mock.calls[0].length).toBe(2);
    expect(mixpanelTrackMock.mock.calls[0][0]).toBe(
      "SETTINGS_3P_ACCESS_LOG_ERROR"
    );
    expect(mixpanelTrackMock.mock.calls[0][1]).toEqual({
      event_category: "KO",
      event_type: "error",
      reason: referenceReason
    });
  });
});

describe("computeAndTrackDataShare", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  organizationFiscalCodes.forEach(organizationFiscalCode =>
    organizationNames.forEach(organizationName =>
      serviceNames.forEach(serviceName =>
        ctaLabels.forEach(ctaLabel => {
          it(`should call 'trackDataShare', matching event name, and expected parameters for ${
            organizationFiscalCode ? "defined   " : "undefined "
          } organization fiscal code, ${
            organizationName ? "defined   " : "undefined "
          } organization name, ${
            serviceName ? "defined   " : "undefined "
          } service name, ${
            ctaLabel ? "defined   " : "undefined "
          } cta label`, () => {
            jest
              .spyOn(fimsAuthenticationSelectors, "fimsCtaTextSelector")
              .mockImplementation(_ => ctaLabel);
            const mixpanelTrackMock = generateMixpanelTrackMock();
            const service = {
              id: referenceServiceId,
              name: serviceName,
              organization: {
                fiscal_code: organizationFiscalCode,
                name: organizationName
              }
            } as ServiceDetails;
            const globalState = {} as GlobalState;

            void computeAndTrackDataShare(service, globalState);

            expect(mixpanelTrackMock.mock.calls.length).toBe(1);
            expect(mixpanelTrackMock.mock.calls[0].length).toBe(2);
            expect(mixpanelTrackMock.mock.calls[0][0]).toBe("FIMS_DATA_SHARE");
            expect(mixpanelTrackMock.mock.calls[0][1]).toEqual({
              event_category: "UX",
              event_type: "screen_view",
              fims_label: ctaLabel,
              organization_fiscal_code: organizationFiscalCode,
              organization_name: organizationName,
              service_id: service.id,
              service_name: serviceName
            });
          });
        })
      )
    )
  );
});

describe("computeAndTrackDataShareAccepted", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  organizationFiscalCodes.forEach(organizationFiscalCode =>
    organizationNames.forEach(organizationName =>
      serviceNames.forEach(serviceName =>
        ctaLabels.forEach(ctaLabel => {
          it(`should call 'trackDataShareAccepted', matching event name, and expected parameters for ${
            organizationFiscalCode ? "defined   " : "undefined "
          } organization fiscal code, ${
            organizationName ? "defined   " : "undefined "
          } organization name, ${
            serviceName ? "defined   " : "undefined "
          } service name, ${
            ctaLabel ? "defined   " : "undefined "
          } cta label`, () => {
            const service = {
              id: referenceServiceId,
              name: serviceName,
              organization: {
                fiscal_code: organizationFiscalCode,
                name: organizationName
              }
            } as ServiceDetails;
            jest
              .spyOn(serviceSelectors, "serviceDetailsByIdSelector")
              .mockImplementation((_state, innerServiceId) =>
                innerServiceId === service.id ? service : undefined
              );
            jest
              .spyOn(fimsAuthenticationSelectors, "fimsCtaTextSelector")
              .mockImplementation(_ => ctaLabel);
            const mixpanelTrackMock = generateMixpanelTrackMock();
            const globalState = {} as GlobalState;

            void computeAndTrackDataShareAccepted(
              referenceServiceId,
              globalState
            );

            expect(mixpanelTrackMock.mock.calls.length).toBe(1);
            expect(mixpanelTrackMock.mock.calls[0].length).toBe(2);
            expect(mixpanelTrackMock.mock.calls[0][0]).toBe(
              "FIMS_DATA_SHARE_ACCEPTED"
            );
            expect(mixpanelTrackMock.mock.calls[0][1]).toEqual({
              event_category: "UX",
              event_type: "action",
              fims_label: ctaLabel,
              organization_fiscal_code: organizationFiscalCode,
              organization_name: organizationName,
              service_id: service.id,
              service_name: serviceName
            });
          });
        })
      )
    )
  );
});

const generateMixpanelTrackMock = () =>
  jest
    .spyOn(mixpanel, "mixpanelTrack")
    .mockImplementation((_event, _properties) => undefined);
