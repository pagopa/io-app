import { View } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { Image, ImageSourcePropType } from "react-native";

type Props = {
  heading: Node;
  icon: ImageSourcePropType;
};

/**
 * Component that implements the screen header with heading to the left
 * and an icon image to the right
 */
class ScreenHeader extends React.Component<Props> {
  public render() {
    const { heading, icon } = this.props;

    return (
      <View>
        {heading}

        <View>
          <Image source={icon} />
        </View>
      </View>
    );
  }
}

export default connectStyle(
  "UIComponent.ScreenHeader",
  {},
  mapPropsToStyleNames
)(ScreenHeader);
