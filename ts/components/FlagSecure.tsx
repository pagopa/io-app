import { useEffect } from "react";
import * as React from "react";
import FlagSecure from "react-native-flag-secure-android";
import { connect } from "react-redux";
import { isAllowedSnapshotCurrentScreen } from "../store/reducers/allowedSnapshotScreens";
import { GlobalState } from "../store/reducers/types";

type Props = ReturnType<typeof mapStateToProps>;

/**
 *
 * On Android, it enables or disables FLAG_SECURE based on the isAllowedSnapshotCurrentScreen prop.
 *
 * @param props
 * @constructor
 */
const FlagSecureComponent: React.FunctionComponent<Props> = props => {
  useEffect(
    () => {
      if (props.isAllowedSnapshotCurrentScreen) {
        FlagSecure.deactivate();
      } else {
        FlagSecure.activate();
      }
    },
    [props.isAllowedSnapshotCurrentScreen]
  );
  return null;
};

const mapStateToProps = (state: GlobalState) => ({
  isAllowedSnapshotCurrentScreen: isAllowedSnapshotCurrentScreen(state)
});

export default connect(mapStateToProps)(FlagSecureComponent);
