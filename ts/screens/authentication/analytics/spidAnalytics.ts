import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";

function trackLoginSpidGenericError() {
  void mixpanelTrack(
    "LOGIN_SPID_GENERIC_ERROR",
    buildEventProperties("KO", undefined)
  );
}

function trackLoginSpidAttemptsError() {
  void mixpanelTrack(
    "LOGIN_SPID_ATTEMPTS_ERROR",
    buildEventProperties("KO", undefined)
  );
}

function trackLoginSpid2StepError() {
  void mixpanelTrack(
    "LOGIN_SPID_SECURITY_LEVEL",
    buildEventProperties("KO", undefined)
  );
}

function trackLoginSpidTimeoutError() {
  void mixpanelTrack(
    "LOGIN_SPID_TIMEOUT_ERROR",
    buildEventProperties("KO", undefined)
  );
}

function trackLoginSpidDataSharingError() {
  void mixpanelTrack(
    "LOGIN_SPID_DATA_SHARING_ERROR",
    buildEventProperties("KO", undefined)
  );
}

function trackLoginSpidIdentityError() {
  void mixpanelTrack(
    "LOGIN_SPID_IDENTITY_ERROR",
    buildEventProperties("KO", undefined)
  );
}

function trackLoginSpidCancelError() {
  void mixpanelTrack(
    "LOGIN_SPID_CANCEL_ERROR",
    buildEventProperties("KO", undefined)
  );
}

export function trackLoginSpidError(errorCode?: string) {
  switch (errorCode) {
    case "19": {
      trackLoginSpidAttemptsError();
      return;
    }
    case "20": {
      trackLoginSpid2StepError();
      return;
    }
    case "21": {
      trackLoginSpidTimeoutError();
      return;
    }
    case "22": {
      trackLoginSpidDataSharingError();
      return;
    }
    case "23": {
      trackLoginSpidIdentityError();
      return;
    }
    case "25": {
      trackLoginSpidCancelError();
      return;
    }
    default: {
      trackLoginSpidGenericError();
      return;
    }
  }
}

export function trackLoginSpidIdpSelected(idp: string) {
  void mixpanelTrack(
    "LOGIN_SPID_IDP_SELECTED",
    buildEventProperties("UX", "action", {
      idp
    })
  );
}
