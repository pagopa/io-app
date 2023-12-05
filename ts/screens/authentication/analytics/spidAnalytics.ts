import { mixpanelTrack } from "../../../mixpanel";
import { updateMixpanelProfileProperties } from "../../../mixpanelConfig/profileProperties";
import { GlobalState } from "../../../store/reducers/types";
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
    "LOGIN_SPID_2STEP_ERROR",
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

export async function trackLoginSpidIdpSelected(
  idp: string,
  state: GlobalState
) {
  await updateMixpanelProfileProperties(state, {
    property: "LOGIN_METHOD",
    value: idp
  });
  await mixpanelTrack(
    "LOGIN_SPID_IDP_SELECTED",
    buildEventProperties("UX", "action", {
      idp
    })
  );
}
