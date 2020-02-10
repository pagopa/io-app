/**
 * A component to render the screen content header. It can include:
 * - an image, displayed on the right of the title
 * - a subtitle, displayed below the title
 */
import { H1, Text, View } from "native-base";
import * as React from "react";
import { Animated, ImageSourcePropType, StyleSheet } from "react-native";
import variables from "../../theme/variables";
import ScreenHeader from "../ScreenHeader";

type Props = Readonly<{
  title?: string;
  icon?: ImageSourcePropType;
  subtitle?: string;
  dark?: boolean;
  dynamicHeight?: Animated.AnimatedInterpolation;
}>;

const styles = StyleSheet.create({
  subheaderContainer: {
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding
  },
  screenHeaderHeading: {
    flex: 1,
    fontSize: variables.fontSize4,
    lineHeight: 40,
    marginRight: variables.contentPadding
  },
  darkGrayBg: {
    backgroundColor: variables.brandDarkGray
  },
  white: {
    color: variables.colorWhite
  }
});

export class ScreenContentHeader extends React.PureComponent<Props> {
  public render() {
    const { subtitle, dark, icon, dynamicHeight } = this.props;

    return (
      <View style={dark && styles.darkGrayBg}>
        <Animated.View
          style={
            dynamicHeight !== undefined && { height: dynamicHeight } // if the condition "!== undefined" is not specified, once dynamicHeight.value = 0, dynamicHeight is assumend as false
          }
        >
          <View spacer={true} />
          <ScreenHeader
            heading={
              <H1 style={[styles.screenHeaderHeading, dark && styles.white]}>
                {this.props.title}
              </H1>
            }
            icon={icon}
            dark={dark}
          />
          {subtitle ? (
            <View style={styles.subheaderContainer}>
              <Text>{subtitle}</Text>
              <View spacer={true} large={true} />
            </View>
          ) : (
            <View spacer={true} />
          )}
        </Animated.View>
      </View>
    );
  }
}
