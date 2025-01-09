import * as React from "react";
import { useEffect } from "react";
import RNScreenshotPrevent from "react-native-screenshot-prevent";
import { connect } from "react-redux";
import { isAllowedSnapshotCurrentScreen } from "../store/reducers/allowedSnapshotScreens";
import { GlobalState } from "../store/reducers/types";

type Props = ReturnType<typeof mapStateToProps>;

/**
 *
 * Disable screenshots on iOS. The library implementation uses a hidden secure text field,
 * as iOS does not expose an API to disable screenshots.
 *
 * @param props
 * @constructor
 */
const FlagSecureComponent: React.FunctionComponent<Props> = props => {
  useEffect(() => {
    if (props.isAllowedSnapshotCurrentScreen) {
      RNScreenshotPrevent.disableSecureView();
    } else {
      RNScreenshotPrevent.enableSecureView();
    }
  }, [props.isAllowedSnapshotCurrentScreen]);
  return null;
};

const mapStateToProps = (state: GlobalState) => ({
  isAllowedSnapshotCurrentScreen: isAllowedSnapshotCurrentScreen(state)
});

export default connect(mapStateToProps)(FlagSecureComponent);
