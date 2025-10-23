import { FunctionComponent } from "react";
import { connect } from "react-redux";
import {
  isAppSupportedSelector,
  versionInfoDataSelector
} from "../../common/versionInfo/store/reducers/versionInfo";
import {
  trackLoginSessionTimeoutPostPin,
  trackLoginSessionTimeoutPrePin
} from "../../features/authentication/fastLogin/analytics";
import FastLoginModals from "../../features/authentication/fastLogin/screens/FastLoginModals";
import {
  isFastLoginUserInteractionNeededForSessionExpiredSelector,
  tokenRefreshSelector
} from "../../features/authentication/fastLogin/store/selectors";
import UnsupportedDeviceScreen from "../../features/lollipop/screens/UnsupportedDeviceScreen";
import { isDeviceSupportedSelector } from "../../features/lollipop/store/reducers/lollipop";
import { GetProfileEndpointTransientError } from "../../features/startup/screens/errors/GetProfileEndpointTransientError";
import { GetSessionEndpointTransientError } from "../../features/startup/screens/errors/GetSessionEndpointTransientError";
import { mixpanelTrack } from "../../mixpanel";
import { isBackendServicesStatusOffSelector } from "../../store/reducers/backendStatus/backendInfo";
import { startupTransientErrorSelector } from "../../store/reducers/startup";
import { GlobalState } from "../../store/reducers/types";
import { IdentificationModal } from "../../features/identification/screens/IdentificationModal";
import SystemOffModal from "./SystemOffModal";
import UpdateAppModal from "./UpdateAppModal";

type Props = ReturnType<typeof mapStateToProps>;

/**
 * This is a wrapper of all possible modals the app can show (without user interaction), in this order:
 * - SystemOffModal -> when backend systems are off the app avoids its usage by showing a modal
 * - UpdateAppModal -> when the backend is not compliant anymore with the app, this modal is shown to force an update
 * - IdentificationModal -> the default case. It renders itself only if an identification action is required
 */
const RootModal: FunctionComponent<Props> = (props: Props) => {
  if (!props.isDeviceSupported) {
    return <UnsupportedDeviceScreen />;
  }
  // avoid app usage if backend systems are OFF
  if (props.isBackendServicesStatusOff) {
    return <SystemOffModal />;
  }
  // if the app is out of date, force a screen to update it
  if (!props.isAppSupported) {
    void mixpanelTrack("UPDATE_APP_MODAL", {
      minVersioniOS: props.versionInfo?.min_app_version.ios,
      minVersionAndroid: props.versionInfo?.min_app_version.android
    });
    return <UpdateAppModal />;
  }

  const fastLoginModals = FastLoginModals(
    props.tokenRefreshing,
    props.isFastLoginUserInteractionNeeded
  );

  if (fastLoginModals) {
    if (props.tokenRefreshing.kind === "no-pin-error") {
      trackLoginSessionTimeoutPrePin();
    } else if (props.tokenRefreshing.kind === "transient-error") {
      trackLoginSessionTimeoutPostPin();
    }
    return fastLoginModals;
  }

  if (
    props.startupTransientError.kind === "GET_SESSION_DOWN" &&
    props.startupTransientError.showError
  ) {
    return <GetSessionEndpointTransientError />;
  }

  if (
    props.startupTransientError.kind === "GET_PROFILE_DOWN" &&
    props.startupTransientError.showError
  ) {
    return <GetProfileEndpointTransientError />;
  }

  return <IdentificationModal />;
};

const mapStateToProps = (state: GlobalState) => ({
  isBackendServicesStatusOff: isBackendServicesStatusOffSelector(state),
  isAppSupported: isAppSupportedSelector(state),
  versionInfo: versionInfoDataSelector(state),
  isDeviceSupported: isDeviceSupportedSelector(state),
  isFastLoginUserInteractionNeeded:
    isFastLoginUserInteractionNeededForSessionExpiredSelector(state),
  tokenRefreshing: tokenRefreshSelector(state),
  startupTransientError: startupTransientErrorSelector(state)
});

export default connect(mapStateToProps)(RootModal);
