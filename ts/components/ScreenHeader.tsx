import { View } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { Image, ImageSourcePropType } from "react-native";
import customVariables from "../theme/variables";

type Props = {
  heading: React.ReactNode;
  icon?: ImageSourcePropType;
};

/**
 * Component that implements the screen header with heading to the left
 * and an icon image to the right
 */
const ScreenHeader: React.SFC<Props> = ({ heading, icon }) => {
  return (
    <View>
      {heading}
      {icon && (
        <View>
          <Image
            source={icon}
            style={{
              height: customVariables.h1FontSize * 2,
              resizeMode: "contain"
            }}
          />
        </View>
      )}
    </View>
  );
};

export default connectStyle(
  "UIComponent.ScreenHeader",
  {},
  mapPropsToStyleNames
)(ScreenHeader);
