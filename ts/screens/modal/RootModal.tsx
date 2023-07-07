import I18n from "i18n-js";
import * as React from "react";
import { connect, useDispatch } from "react-redux";
import {
  isAppSupportedSelector,
  versionInfoDataSelector
} from "../../common/versionInfo/store/reducers/versionInfo";
import UnsupportedDeviceScreen from "../../features/lollipop/screens/UnsupportedDeviceScreen";
import { isDeviceSupportedSelector } from "../../features/lollipop/store/reducers/lollipop";
import { mixpanelTrack } from "../../mixpanel";
import { isBackendServicesStatusOffSelector } from "../../store/reducers/backendStatus";
import { isFastLoginUserInteractionNeededForSessionExpiredSelector } from "../../features/fastLogin/store/selectors";
import { GlobalState } from "../../store/reducers/types";
import AskUserToContinueScreen from "../../features/fastLogin/screens/AskUserToContinueScreen";
import { askUserToRefreshSessionToken } from "../../store/actions/authentication";
import { itWalletEnabled } from "../../config";
import { isDevEnv, isTestEnv } from "../../utils/environment";
import IdentificationModal from "./IdentificationModal";
import SystemOffModal from "./SystemOffModal";
import UpdateAppModal from "./UpdateAppModal";

type Props = ReturnType<typeof mapStateToProps>;

/**
 * This is a wrapper of all possible modals the app can show (without user interaction), in this order:
 * - SystemOffModal -> when backend systems are off the app avoids its usage by showing a modal
 * - UpdateAppModal -> when the backend is not compliant anymore with the app, this modal is shown to force an update
 * - IdentificationModal -> the default case. It renders itself only if an identification action is required
 */
const RootModal: React.FunctionComponent<Props> = (props: Props) => {
  const dispatch = useDispatch();

  if (props.isFastLoginUserInteractionNeeded) {
    return (
      <AskUserToContinueScreen
        pictogramName="timeout"
        title={I18n.t(
          "fastLogin.userInteraction.sessionExpired.continueNavigation.title"
        )}
        subtitle={I18n.t(
          "fastLogin.userInteraction.sessionExpired.continueNavigation.subtitle"
        )}
        onSubmit={() => {
          dispatch(askUserToRefreshSessionToken.success("yes"));
        }}
        buttonStylesProps={{
          submitButtonStyle: {
            type: "solid",
            title: I18n.t(
              "fastLogin.userInteraction.sessionExpired.continueNavigation.submitButtonTitle"
            )
          }
        }}
      />
    );
  }

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
  return <IdentificationModal />;
};

const mapStateToProps = (state: GlobalState) => ({
  isBackendServicesStatusOff: isBackendServicesStatusOffSelector(state),
  isAppSupported: isAppSupportedSelector(state),
  versionInfo: versionInfoDataSelector(state),
  isDeviceSupported: isDeviceSupportedSelector(state),
  isFastLoginUserInteractionNeeded:
    isFastLoginUserInteractionNeededForSessionExpiredSelector(state)
});

export default connect(mapStateToProps)(RootModal);
