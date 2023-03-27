/**
 * A component to render the screen content header. It can include:
 * - an image, displayed on the right of the title
 * - a subtitle, displayed below the title
 */
import { Text as NBText } from "native-base";
import * as React from "react";
import { View, Animated, ImageSourcePropType, StyleSheet } from "react-native";
import { IconProps } from "react-native-vector-icons/Icon";
import {
  HEADER_ANIMATION_DURATION,
  HEADER_HEIGHT
} from "../../utils/constants";
import ScreenHeader from "../ScreenHeader";
import { H1 } from "../../components/core/typography/H1";

import variables from "../../theme/variables";
import { IOColors } from "../core/variables/IOColors";
import { VSpacer } from "../core/spacer/Spacer";

type Props = Readonly<{
  title?: string;
  icon?: ImageSourcePropType;
  iconFont?: IconProps;
  subtitle?: string;
  subtitleLink?: JSX.Element;
  dark?: boolean;
  dynamicHeight?: Animated.AnimatedInterpolation;
  // Specified if a custom component is needed, if both icon and rightComponent are defined rightComponent
  // will be rendered in place of icon
  rightComponent?: React.ReactElement;
}>;

const styles = StyleSheet.create({
  subheaderContainer: {
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding
  },
  darkGrayBg: {
    backgroundColor: IOColors.bluegrey
  }
});

const shouldCollapse = 1 as unknown as Animated.AnimatedInterpolation;
const shouldExpand = 0 as unknown as Animated.AnimatedInterpolation;

export class ScreenContentHeader extends React.PureComponent<Props> {
  private heightAnimation: Animated.Value;
  private elapse: Animated.CompositeAnimation;
  private collapse: Animated.CompositeAnimation;

  constructor(props: Props) {
    super(props);

    // Initialize animated value
    this.heightAnimation = new Animated.Value(HEADER_HEIGHT);

    // Animation to elapse the header height from 0 to HEADER_HEIGHT
    this.elapse = Animated.timing(this.heightAnimation, {
      useNativeDriver: false,
      toValue: HEADER_HEIGHT,
      duration: HEADER_ANIMATION_DURATION
    });

    // Animation to collapse the header height from HEADER_HEIGHT to 0
    this.collapse = Animated.timing(this.heightAnimation, {
      useNativeDriver: false,
      toValue: 0,
      duration: HEADER_ANIMATION_DURATION
    });
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.props.dynamicHeight !== prevProps.dynamicHeight) {
      if (this.props.dynamicHeight === shouldCollapse) {
        this.elapse.stop();
        this.collapse.start();
      }
      if (this.props.dynamicHeight === shouldExpand) {
        this.collapse.stop();
        this.elapse.start();
      }
    }
  }

  public render() {
    const {
      subtitle,
      subtitleLink,
      dark,
      icon,
      iconFont,
      title,
      rightComponent
    } = this.props;

    return (
      <View style={dark && styles.darkGrayBg}>
        <Animated.View
          style={
            this.props.dynamicHeight !== undefined && {
              height: this.heightAnimation
            }
          } // if the condition "!== undefined" is not specified, once dynamicHeight.value = 0, dynamicHeight is assumend as false
        >
          <VSpacer size={16} />
          <ScreenHeader
            heading={
              <H1
                accessible={true}
                accessibilityRole="header"
                weight="Bold"
                testID={"screen-content-header-title"}
                color={dark ? "white" : "bluegreyDark"}
              >
                {title}
              </H1>
            }
            icon={icon}
            iconFont={iconFont}
            dark={dark}
            rightComponent={rightComponent}
          />
          {subtitle && (
            <View style={styles.subheaderContainer}>
              <NBText testID={"screen-content-header-subtitle"}>
                {subtitle}
              </NBText>
              {subtitleLink}
              <VSpacer size={24} />
            </View>
          )}
        </Animated.View>
      </View>
    );
  }
}
