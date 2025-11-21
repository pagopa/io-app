import { mixpanelTrack } from "../../../../mixpanel";
import { updateMixpanelProfileProperties } from "../../../../mixpanelConfig/profileProperties";
import { GlobalState } from "../../../../store/reducers/types";
import { buildEventProperties } from "../../../../utils/analytics";
import { LoginType } from "../../activeSessionLogin/screens/analytics";
import { AUTH_ERRORS } from "../components/AuthErrorComponent";

export type EventProperties = {
  idp: string;
  "error message"?: string;
  flow: LoginType;
};

function trackLoginSpidGenericError(properties?: EventProperties) {
  void mixpanelTrack(
    "LOGIN_SPID_GENERIC_ERROR",
    buildEventProperties("KO", undefined, properties)
  );
}

function trackLoginSpidAttemptsError(properties?: EventProperties) {
  void mixpanelTrack(
    "LOGIN_SPID_ATTEMPTS_ERROR",
    buildEventProperties("KO", undefined, properties)
  );
}

function trackLoginSpid2StepError(properties?: EventProperties) {
  void mixpanelTrack(
    "LOGIN_SPID_SECURITY_LEVEL",
    buildEventProperties("KO", undefined, properties)
  );
}

function trackLoginSpidTimeoutError(properties?: EventProperties) {
  void mixpanelTrack(
    "LOGIN_SPID_TIMEOUT_ERROR",
    buildEventProperties("KO", undefined, properties)
  );
}

function trackLoginSpidDataSharingError(properties?: EventProperties) {
  void mixpanelTrack(
    "LOGIN_SPID_DATA_SHARING_ERROR",
    buildEventProperties("KO", undefined, properties)
  );
}

function trackLoginSpidIdentityError(properties?: EventProperties) {
  void mixpanelTrack(
    "LOGIN_SPID_IDENTITY_ERROR",
    buildEventProperties("KO", undefined, properties)
  );
}

function trackLoginSpidCancelError(properties?: EventProperties) {
  void mixpanelTrack(
    "LOGIN_SPID_CANCEL_ERROR",
    buildEventProperties("KO", undefined, properties)
  );
}
function trackMissingSAMLResponseError(properties?: EventProperties) {
  void mixpanelTrack(
    "LOGIN_ERROR_MESSAGE",
    buildEventProperties("KO", undefined, properties)
  );
}
export function trackLoginSpidError(
  errorCode?: string,
  properties: EventProperties = { idp: "unknown", flow: "auth" }
) {
  switch (errorCode) {
    case AUTH_ERRORS.ERROR_19: {
      trackLoginSpidAttemptsError(properties);
      return;
    }
    case AUTH_ERRORS.ERROR_20: {
      trackLoginSpid2StepError(properties);
      return;
    }
    case AUTH_ERRORS.ERROR_21: {
      trackLoginSpidTimeoutError(properties);
      return;
    }
    case AUTH_ERRORS.ERROR_22: {
      trackLoginSpidDataSharingError(properties);
      return;
    }
    case AUTH_ERRORS.ERROR_23: {
      trackLoginSpidIdentityError(properties);
      return;
    }
    case AUTH_ERRORS.ERROR_25:
    case AUTH_ERRORS.CIEID_IOS_OPERATION_CANCELED_MESSAGE:
    case AUTH_ERRORS.CIEID_OPERATION_CANCEL: {
      trackLoginSpidCancelError(properties);
      return;
    }
    case AUTH_ERRORS.MISSING_SAML_RESPONSE: {
      trackMissingSAMLResponseError(properties);
      return;
    }
    default: {
      trackLoginSpidGenericError(properties);
      return;
    }
  }
}
// miss on ASL (check it)
export async function updateLoginMethodProfileProperty(
  state: GlobalState,
  value: string
) {
  await updateMixpanelProfileProperties(state, {
    property: "LOGIN_METHOD",
    value
  });
}
export async function trackLoginSpidIdpSelected(
  idp: string,
  state: GlobalState,
  flow: LoginType = "auth"
) {
  if (flow === "auth") {
    await updateLoginMethodProfileProperty(state, idp);
  }
  mixpanelTrack(
    "LOGIN_SPID_IDP_SELECTED",
    buildEventProperties("UX", "action", {
      idp,
      flow
    })
  );
}
