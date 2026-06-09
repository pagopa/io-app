import * as Mixpanel from "../../../../../mixpanel";
import {
  ITW_CREDENTIALS_ERRORS_EVENTS,
  ITW_CREDENTIALS_TECH_EVENTS
} from "../enum";
import {
  trackItwVaultCoherenceCheckFailed,
  trackItwVaultCredentialRemoveFailed,
  trackItwVaultCredentialStoreFailed,
  trackItwVaultMigrationFailed,
  trackItwVaultMigrationRequest,
  trackItwVaultMigrationSuccess,
  trackItwVaultOrphanedCredentialsFound
} from "../index";

const credentialIds = ["credential-1", "credential-2"];
const reason = "Vault failure";

describe("credentials analytics", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    {
      name: "trackItwVaultCredentialStoreFailed",
      track: () =>
        trackItwVaultCredentialStoreFailed({
          credential_ids: credentialIds,
          reason
        }),
      eventName:
        ITW_CREDENTIALS_ERRORS_EVENTS.ITW_VAULT_CREDENTIAL_STORE_FAILED,
      properties: {
        event_category: "KO",
        event_type: "error",
        flow: undefined,
        credential_ids: credentialIds,
        reason
      }
    },
    {
      name: "trackItwVaultCredentialRemoveFailed",
      track: () =>
        trackItwVaultCredentialRemoveFailed({
          credential_ids: credentialIds,
          reason
        }),
      eventName:
        ITW_CREDENTIALS_ERRORS_EVENTS.ITW_VAULT_CREDENTIAL_REMOVE_FAILED,
      properties: {
        event_category: "KO",
        event_type: "error",
        flow: undefined,
        credential_ids: credentialIds,
        reason
      }
    },
    {
      name: "trackItwVaultMigrationFailed",
      track: () =>
        trackItwVaultMigrationFailed(
          { credential_ids: credentialIds, reason },
          true
        ),
      eventName: ITW_CREDENTIALS_ERRORS_EVENTS.ITW_VAULT_MIGRATION_FAILED,
      properties: {
        event_category: "KO",
        event_type: "error",
        flow: undefined,
        credential_ids: credentialIds,
        reason
      }
    },
    {
      name: "trackItwVaultCoherenceCheckFailed",
      track: () => trackItwVaultCoherenceCheckFailed(reason, true),
      eventName: ITW_CREDENTIALS_ERRORS_EVENTS.ITW_VAULT_COHERENCE_CHECK_FAILED,
      properties: {
        event_category: "KO",
        event_type: "error",
        flow: undefined,
        reason
      }
    },
    {
      name: "trackItwVaultOrphanedCredentialsFound",
      track: () =>
        trackItwVaultOrphanedCredentialsFound(
          { credential_ids: credentialIds, origin: "vault" },
          true
        ),
      eventName:
        ITW_CREDENTIALS_ERRORS_EVENTS.ITW_VAULT_ORPHANED_CREDENTIALS_FOUND,
      properties: {
        event_category: "KO",
        event_type: "error",
        flow: undefined,
        credential_ids: credentialIds,
        origin: "vault"
      }
    },
    {
      name: "trackItwVaultMigrationRequest",
      track: () => trackItwVaultMigrationRequest(true),
      eventName: ITW_CREDENTIALS_TECH_EVENTS.ITW_VAULT_MIGRATION_REQUEST,
      properties: {
        event_category: "TECH",
        event_type: undefined,
        flow: undefined
      }
    },
    {
      name: "trackItwVaultMigrationSuccess",
      track: () => trackItwVaultMigrationSuccess(true),
      eventName: ITW_CREDENTIALS_TECH_EVENTS.ITW_VAULT_MIGRATION_SUCCESS,
      properties: {
        event_category: "TECH",
        event_type: undefined,
        flow: undefined
      }
    }
  ])(
    "$name tracks immediately when Mixpanel is initialized",
    ({ track, eventName, properties }) => {
      jest
        .spyOn(Mixpanel, "isMixpanelInstanceInitialized")
        .mockReturnValue(true);
      const spiedOnMixpanelTrack = jest
        .spyOn(Mixpanel, "mixpanelTrack")
        .mockImplementation();
      const spiedOnEnqueueMixpanelEvent = jest
        .spyOn(Mixpanel, "enqueueMixpanelEvent")
        .mockImplementation();

      track();

      expect(spiedOnMixpanelTrack).toHaveBeenCalledWith(eventName, properties);
      expect(spiedOnEnqueueMixpanelEvent).not.toHaveBeenCalled();
    }
  );

  it.each([
    {
      name: "trackItwVaultCredentialStoreFailed",
      track: () =>
        trackItwVaultCredentialStoreFailed({
          credential_ids: credentialIds,
          reason
        }),
      eventName:
        ITW_CREDENTIALS_ERRORS_EVENTS.ITW_VAULT_CREDENTIAL_STORE_FAILED,
      properties: {
        event_category: "KO",
        event_type: "error",
        flow: undefined,
        credential_ids: credentialIds,
        reason
      }
    },
    {
      name: "trackItwVaultCredentialRemoveFailed",
      track: () =>
        trackItwVaultCredentialRemoveFailed({
          credential_ids: credentialIds,
          reason
        }),
      eventName:
        ITW_CREDENTIALS_ERRORS_EVENTS.ITW_VAULT_CREDENTIAL_REMOVE_FAILED,
      properties: {
        event_category: "KO",
        event_type: "error",
        flow: undefined,
        credential_ids: credentialIds,
        reason
      }
    }
  ])(
    "$name does not enqueue when Mixpanel is not initialized",
    ({ track, eventName, properties }) => {
      jest
        .spyOn(Mixpanel, "isMixpanelInstanceInitialized")
        .mockReturnValue(false);
      const spiedOnMixpanelTrack = jest
        .spyOn(Mixpanel, "mixpanelTrack")
        .mockImplementation();
      const spiedOnEnqueueMixpanelEvent = jest
        .spyOn(Mixpanel, "enqueueMixpanelEvent")
        .mockImplementation();

      track();

      expect(spiedOnMixpanelTrack).toHaveBeenCalledWith(eventName, properties);
      expect(spiedOnEnqueueMixpanelEvent).not.toHaveBeenCalled();
    }
  );

  it.each([
    {
      name: "trackItwVaultMigrationRequest",
      track: () => trackItwVaultMigrationRequest(null),
      eventName: ITW_CREDENTIALS_TECH_EVENTS.ITW_VAULT_MIGRATION_REQUEST,
      eventId: "ITW_VAULT_MIGRATION_REQUEST",
      properties: {
        event_category: "TECH",
        event_type: undefined,
        flow: undefined
      }
    }
  ])(
    "$name enqueues when Mixpanel is not initialized and tracking is not disabled",
    ({ track, eventName, eventId, properties }) => {
      jest
        .spyOn(Mixpanel, "isMixpanelInstanceInitialized")
        .mockReturnValue(false);
      const spiedOnMixpanelTrack = jest
        .spyOn(Mixpanel, "mixpanelTrack")
        .mockImplementation();
      const spiedOnEnqueueMixpanelEvent = jest
        .spyOn(Mixpanel, "enqueueMixpanelEvent")
        .mockImplementation();

      track();

      expect(spiedOnMixpanelTrack).not.toHaveBeenCalled();
      expect(spiedOnEnqueueMixpanelEvent).toHaveBeenCalledWith(
        eventName,
        eventId,
        properties
      );
    }
  );

  it("does not enqueue boot-time events when Mixpanel is not initialized and tracking is disabled", () => {
    jest
      .spyOn(Mixpanel, "isMixpanelInstanceInitialized")
      .mockReturnValue(false);
    const spiedOnMixpanelTrack = jest
      .spyOn(Mixpanel, "mixpanelTrack")
      .mockImplementation();
    const spiedOnEnqueueMixpanelEvent = jest
      .spyOn(Mixpanel, "enqueueMixpanelEvent")
      .mockImplementation();

    trackItwVaultMigrationRequest(false);

    expect(spiedOnMixpanelTrack).not.toHaveBeenCalled();
    expect(spiedOnEnqueueMixpanelEvent).not.toHaveBeenCalled();
  });
});
