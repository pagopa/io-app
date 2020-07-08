import React from "react";
import { View } from "react-native";
import { connect } from "react-redux";

import { GlobalState } from "../store/reducers/types";
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
    const { size, color } = this.props;
    // since no experimental features are available we force the flag to false (see https://www.pivotaltracker.com/story/show/168263994)
    // when new experimental features will be avaible, pick this flag from props
    const isExperimentalFeaturesEnabled = false;
    return (
      <View accessibilityLabel={""}>
        <IconFont
          size={size}
          color={color}
          name={isExperimentalFeaturesEnabled ? "io-profilo-exp" : "io-profilo"}
        />
      </View>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  isExperimentalFeaturesEnabled:
    state.persistedPreferences.isExperimentalFeaturesEnabled
});

export default connect(mapStateToProps)(ProfileTabIcon);
