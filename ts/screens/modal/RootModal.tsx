import { fromNullable } from "fp-ts/lib/Option";
import * as React from "react";
import { connect } from "react-redux";
import { serverInfoDataSelector } from "../../store/reducers/backendInfo";
import { isBackendServicesStatusOffSelector } from "../../store/reducers/backendStatus";
import { GlobalState } from "../../store/reducers/types";
import { isUpdateNeeded } from "../../utils/appVersion";
import IdentificationModal from "./IdentificationModal";
import SystemOffModal from "./SystemOffModal";
import UpdateAppModal from "./UpdateAppModal";
import RootedDeviceModal from "./RootedDeviceModal";

type Props = ReturnType<typeof mapStateToProps>;

/**
 * This is a wrapper of all possibile modals the app can show (without user interaction), in this order:
 * - SystemOffModal -> when backend systems are off the app avoids its usage by showing a modal
 * - UpdateAppModal -> when the backend is not compliant anymore with the app, this modal is shown to force an update
 * - IdentificationModal -> the default case. It renders it self only if an identification action is required
 */
export const RootModal: React.FunctionComponent<Props> = (props: Props) => {
  return <RootedDeviceModal onContinue={() => {}} onCancel={() => {}} />;
  // avoid app usage if backend systems are OFF
  if (props.isBackendServicesStatusOff) {
    return <SystemOffModal />;
  }
  const isAppOutOfDate = fromNullable(props.backendInfo)
    .map(bi => isUpdateNeeded(bi, "min_app_version"))
    .getOrElse(false);
  // if the app is out of date, force a screen to update it
  if (isAppOutOfDate) {
    return <UpdateAppModal />;
  }
  return <IdentificationModal />;
};

const mapStateToProps = (state: GlobalState) => ({
  isBackendServicesStatusOff: isBackendServicesStatusOffSelector(state),
  backendInfo: serverInfoDataSelector(state)
});

export default connect(mapStateToProps)(RootModal);
