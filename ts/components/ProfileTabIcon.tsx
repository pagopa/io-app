import React from "react";
import { connect } from "react-redux";

import { ColorValue } from "react-native";
import { GlobalState } from "../store/reducers/types";
import { AnimatedIcon } from "./core/icons/Icon";

type OwnProps = {
  size?: number;
  color?: ColorValue;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

/**
 * Profile icon that changes if the experimental features flag is enabled.
 */
class ProfileTabIcon extends React.PureComponent<Props> {
  public render() {
    const { size, color } = this.props;
    // since no experimental features are available we force the flag to false (see https://www.pivotaltracker.com/story/show/168263994)
    // when new experimental features will be avaible, pick this flag from props
    const isExperimentalFeaturesEnabled = false;
    return (
      <AnimatedIcon
        size={size}
        color={color}
        name={
          isExperimentalFeaturesEnabled ? "profileExperiment" : "navProfile"
        }
      />
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  isExperimentalFeaturesEnabled:
    state.persistedPreferences.isExperimentalFeaturesEnabled
});

export default connect(mapStateToProps)(ProfileTabIcon);
