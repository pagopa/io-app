import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import * as mixpanelTrackModule from "../../../../../mixpanel";
import { TimeoutError } from "../../../../../utils/errors";
import { loadServicePreference } from "../../../details/store/actions/preference";
import { WithServiceID } from "../../../details/types/ServicePreferenceResponse";
import {
  featuredInstitutionsGet,
  featuredServicesGet,
  paginatedInstitutionsGet
} from "../../../home/store/actions";
import {
  paginatedServicesGet,
  WithInstitutionID
} from "../../../institution/store/actions";
import { searchPaginatedInstitutionsGet } from "../../../search/store/actions";
import { trackServicesAction } from "../index";

// Mock the mixpanelTrack function
jest.mock("../../../../../mixpanel", () => ({
  mixpanelTrack: jest.fn()
}));

const mockMixpanelTrack = mixpanelTrackModule.mixpanelTrack as jest.Mock;

describe("trackServicesAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should track services home error for paginatedInstitutionsGet.failure action", () => {
    const error: TimeoutError = { kind: "timeout" };
    const action = paginatedInstitutionsGet.failure(error);

    trackServicesAction(action);

    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe("SERVICES_ERROR");
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "KO",
      reason: "timeout",
      source: "main_list"
    });
  });

  it("should track services home error for featuredServicesGet.failure action", () => {
    const error: TimeoutError = { kind: "timeout" };
    const action = featuredServicesGet.failure(error);

    trackServicesAction(action);

    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe("SERVICES_ERROR");
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "KO",
      reason: "timeout",
      source: "featured_services"
    });
  });

  it("should track services home error for featuredInstitutionsGet.failure action", () => {
    const error: TimeoutError = { kind: "timeout" };
    const action = featuredInstitutionsGet.failure(error);

    trackServicesAction(action);

    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe("SERVICES_ERROR");
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "KO",
      reason: "timeout",
      source: "featured_organizations"
    });
  });

  it("should track search result for searchPaginatedInstitutionsGet.success action", () => {
    const payload = { count: 5, offset: 0, limit: 0, institutions: [] };
    const action = searchPaginatedInstitutionsGet.success(payload);

    trackServicesAction(action);

    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe(
      "SERVICES_SEARCH_RESULT_PAGE"
    );
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "UX",
      event_type: "screen_view",
      results_count: payload.count
    });
  });

  it("should track search error for searchPaginatedInstitutionsGet.failure action", () => {
    const error: TimeoutError = { kind: "timeout" };
    const action = searchPaginatedInstitutionsGet.failure(error);

    trackServicesAction(action);

    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe("SERVICES_SEARCH_ERROR");
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "KO",
      reason: "timeout"
    });
  });

  it("should track institution details error for paginatedServicesGet.failure action", () => {
    const error: WithInstitutionID<TimeoutError> = {
      id: "anId",
      kind: "timeout"
    };
    const action = paginatedServicesGet.failure(error);

    trackServicesAction(action);

    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe(
      "SERVICES_ORGANIZATION_DETAIL_ERROR"
    );
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "KO",
      reason: "timeout",
      organization_fiscal_code: error.id
    });
  });

  it("should track service details error for loadServicePreference.failure action", () => {
    const error: WithServiceID<TimeoutError> = {
      id: "anId" as ServiceId,
      kind: "timeout"
    };
    const action = loadServicePreference.failure(error);

    trackServicesAction(action);

    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe("SERVICES_DETAIL_ERROR");
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      event_category: "KO",
      reason: "timeout",
      service_id: error.id
    });
  });

  it("should not call mixpanelTrack for unhandled actions", () => {
    const unhandledAction = {
      type: "UNHANDLED_ACTION_TYPE",
      payload: {}
    };

    trackServicesAction(unhandledAction as any);

    expect(mockMixpanelTrack.mock.calls.length).toBe(0);
  });
});
