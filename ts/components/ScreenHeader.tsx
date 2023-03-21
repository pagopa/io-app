import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { View, Image, ImageSourcePropType, StyleSheet } from "react-native";
import { IconProps } from "react-native-vector-icons/Icon";
import customVariables from "../theme/variables";
import { HEADER_ICON_HEIGHT } from "../utils/constants";
import { IOColors } from "../components/core/variables/IOColors";
import IconFont from "./ui/IconFont";
import { IOStyles } from "./core/variables/IOStyles";

type Props = {
  heading: React.ReactNode;
  icon?: ImageSourcePropType;
  iconFont?: IconProps;
  dark?: boolean;
  // Specified if a custom component is needed, if both icon and rightComponent are defined rightComponent
  // will be rendered in place of icon
  rightComponent?: React.ReactElement;
};

const styles = StyleSheet.create({
  darkGrayBg: {
    backgroundColor: IOColors.bluegrey
  },
  container: {
    justifyContent: "space-between",
    paddingHorizontal: customVariables.contentPadding,
    minHeight: HEADER_ICON_HEIGHT
  },
  text: {
    flex: 1,
    flexGrow: 1
  },
  image: {
    maxHeight: HEADER_ICON_HEIGHT,
    maxWidth: HEADER_ICON_HEIGHT,
    resizeMode: "contain",
    flex: 1
  }
});

/**
 * Component that implements the screen header with heading to the left
 * and an icon image to the right. The icon can be an image or an icon (from io-icon-font)
 */
class ScreenHeader extends React.Component<Props> {
  private getIcon = () => {
    const { icon } = this.props;
    if (icon) {
      return <Image source={icon} style={styles.image} />;
    }
    const { iconFont } = this.props;
    return pipe(
      iconFont,
      O.fromNullable,
      O.fold(
        () => undefined,
        ic => {
          const { dark } = this.props;
          const imageColor = pipe(
            ic.color,
            O.fromNullable,
            O.getOrElse(() =>
              pipe(
                dark,
                O.fromNullable,
                O.fold(
                  () => customVariables.headerIconLight,
                  isDark =>
                    isDark
                      ? customVariables.headerIconDark
                      : customVariables.headerIconLight
                )
              )
            )
          );
          return (
            <IconFont
              importantForAccessibility={"no-hide-descendants"}
              name={ic.name}
              size={Math.min(ic.size || HEADER_ICON_HEIGHT, HEADER_ICON_HEIGHT)}
              color={imageColor}
            />
          );
        }
      )
    );
  };

  public render() {
    const { heading, dark, rightComponent } = this.props;
    return (
      <View
        style={[
          dark && styles.darkGrayBg,
          styles.container,
          IOStyles.row,
          { alignItems: "center" }
        ]}
      >
        <View
          accessible={true}
          style={styles.text}
          accessibilityRole={"header"}
        >
          {heading}
        </View>
        {pipe(
          rightComponent,
          O.fromNullable,
          O.fold(
            () => this.getIcon(),
            c => c
          )
        )}
      </View>
    );
  }
}

export default connectStyle(
  "UIComponent.ScreenHeader",
  {},
  mapPropsToStyleNames
)(ScreenHeader);
