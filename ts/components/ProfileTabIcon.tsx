import React from "react";
import { connect } from "react-redux";

import { GlobalState } from "../store/reducers/types";
import customVariables from "../theme/variables";
import IconFont from "./ui/IconFont";

type OwnProps = {
  size?: number;
  color?: string;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

/**
 * Profile icon that changes if the experimental features flag is enabled.
 */
class ProfileTabIcon extends React.PureComponent<Props> {
  public render() {
    const { size, color, isExperimentalFeaturesEnabled } = this.props;

    return (
      <IconFont
        size={size}
        color={
          isExperimentalFeaturesEnabled ? customVariables.brandHighlight : color
        }
        name={isExperimentalFeaturesEnabled ? "io-profilo-exp" : "io-profilo"}
      />
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  isExperimentalFeaturesEnabled:
    state.persistedPreferences.isExperimentalFeaturesEnabled
});

export default connect(mapStateToProps)(ProfileTabIcon);
