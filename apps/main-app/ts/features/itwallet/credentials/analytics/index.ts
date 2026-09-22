import {
  enqueueMixpanelEvent,
  isMixpanelInstanceInitialized,
  mixpanelTrack
} from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import {
  ITW_CREDENTIALS_ERRORS_EVENTS,
  ITW_CREDENTIALS_TECH_EVENTS
} from "./enum";

type TrackVaultFailureProps = {
  credential_ids: ReadonlyArray<string>;
  reason: string;
};

type TrackVaultOrphanedCredentialsProps = {
  credential_ids: ReadonlyArray<string>;
  origin: "redux" | "vault";
};

/**
 * The pre-initialization Mixpanel queue is keyed by event id. Deriving the id
 * from stable vault identifiers keeps repeated startup retries from enqueuing
 * duplicate copies of the same logical boot-time event.
 */
const buildEnqueuedEventId = (
  eventName: string,
  ...parts: ReadonlyArray<string>
) => [eventName, ...parts.filter(part => part.length > 0)].join(":");

/**
 * Migration/coherence events can run during boot, before Mixpanel has been
 * initialized. In that case we enqueue them unless tracking has been
 * explicitly disabled by the user.
 */
const trackBootTimeVaultEvent = (
  eventName: string,
  properties: Record<string, unknown>,
  isMixpanelEnabled: boolean | null,
  eventId?: string
) => {
  if (isMixpanelInstanceInitialized()) {
    void mixpanelTrack(eventName, properties);
    return;
  }

  if (isMixpanelEnabled !== false) {
    enqueueMixpanelEvent(eventName, eventId || eventName, properties);
  }
};

export const trackItwVaultCredentialStoreFailed = ({
  credential_ids,
  reason
}: TrackVaultFailureProps) => {
  const eventName =
    ITW_CREDENTIALS_ERRORS_EVENTS.ITW_VAULT_CREDENTIAL_STORE_FAILED;
  const properties = buildEventProperties("KO", "error", {
    credential_ids,
    reason
  });

  void mixpanelTrack(eventName, properties);
};

export const trackItwVaultCredentialRemoveFailed = ({
  credential_ids,
  reason
}: TrackVaultFailureProps) => {
  const eventName =
    ITW_CREDENTIALS_ERRORS_EVENTS.ITW_VAULT_CREDENTIAL_REMOVE_FAILED;
  const properties = buildEventProperties("KO", "error", {
    credential_ids,
    reason
  });

  void mixpanelTrack(eventName, properties);
};

export const trackItwVaultMigrationFailed = (
  { credential_ids, reason }: TrackVaultFailureProps,
  isMixpanelEnabled: boolean | null
) => {
  const eventName = ITW_CREDENTIALS_ERRORS_EVENTS.ITW_VAULT_MIGRATION_FAILED;
  const properties = buildEventProperties("KO", "error", {
    credential_ids,
    reason
  });

  trackBootTimeVaultEvent(
    eventName,
    properties,
    isMixpanelEnabled,
    buildEnqueuedEventId(eventName, credential_ids.join(","), reason)
  );
};

export const trackItwVaultCoherenceCheckFailed = (
  reason: string,
  isMixpanelEnabled: boolean | null
) => {
  const eventName =
    ITW_CREDENTIALS_ERRORS_EVENTS.ITW_VAULT_COHERENCE_CHECK_FAILED;
  const properties = buildEventProperties("KO", "error", { reason });

  trackBootTimeVaultEvent(
    eventName,
    properties,
    isMixpanelEnabled,
    buildEnqueuedEventId(eventName, reason)
  );
};

export const trackItwVaultOrphanedCredentialsFound = (
  { credential_ids, origin }: TrackVaultOrphanedCredentialsProps,
  isMixpanelEnabled: boolean | null
) => {
  const eventName =
    ITW_CREDENTIALS_ERRORS_EVENTS.ITW_VAULT_ORPHANED_CREDENTIALS_FOUND;
  const properties = buildEventProperties("KO", "error", {
    credential_ids,
    origin
  });

  trackBootTimeVaultEvent(
    eventName,
    properties,
    isMixpanelEnabled,
    buildEnqueuedEventId(eventName, origin, credential_ids.join(","))
  );
};

export const trackItwVaultMigrationRequest = (
  isMixpanelEnabled: boolean | null
) => {
  const eventName = ITW_CREDENTIALS_TECH_EVENTS.ITW_VAULT_MIGRATION_REQUEST;
  const properties = buildEventProperties("TECH", undefined);

  trackBootTimeVaultEvent(eventName, properties, isMixpanelEnabled);
};

export const trackItwVaultMigrationSuccess = (
  isMixpanelEnabled: boolean | null
) => {
  const eventName = ITW_CREDENTIALS_TECH_EVENTS.ITW_VAULT_MIGRATION_SUCCESS;
  const properties = buildEventProperties("TECH", undefined);

  trackBootTimeVaultEvent(eventName, properties, isMixpanelEnabled);
};
