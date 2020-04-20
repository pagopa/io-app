/**
 * A component to render the screen content header. It can include:
 * - an image, displayed on the right of the title
 * - a subtitle, displayed below the title
 */
import { H3, Text, View } from "native-base";
import * as React from "react";
import { Animated, ImageSourcePropType, StyleSheet } from "react-native";
import variables from "../../theme/variables";
import {
  HEADER_ANIMATION_DURATION,
  HEADER_HEIGHT
} from "../../utils/constants";
import ScreenHeader from "../ScreenHeader";
import { IconProps } from 'react-native-vector-icons/Icon';

type Props = Readonly<{
  title?: string;
  icon?: ImageSourcePropType;
  iconFont?: IconProps;
  subtitle?: string;
  dark?: boolean;
  dynamicHeight?: Animated.AnimatedInterpolation;
}>;

const styles = StyleSheet.create({
  subheaderContainer: {
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding
  },
  darkGrayBg: {
    backgroundColor: variables.brandDarkGray
  },
  white: {
    color: variables.colorWhite
  }
});

const shouldCollapse = (1 as unknown) as Animated.AnimatedInterpolation;
const shouldExpand = (0 as unknown) as Animated.AnimatedInterpolation;

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
      toValue: HEADER_HEIGHT,
      duration: HEADER_ANIMATION_DURATION
    });

    // Animation to collapse the header height from HEADER_HEIGHT to 0
    this.collapse = Animated.timing(this.heightAnimation, {
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
    const { subtitle, dark, icon, iconFont } = this.props;

    return (
      <View style={dark && styles.darkGrayBg}>
        <Animated.View
          style={
            this.props.dynamicHeight !== undefined && {
              height: this.heightAnimation
            }
          } // if the condition "!== undefined" is not specified, once dynamicHeight.value = 0, dynamicHeight is assumend as false
        >
          <View spacer={true} />
          <ScreenHeader
            heading={<H3 style={dark && styles.white}>{this.props.title}</H3>}
            icon={icon}
            iconFont={iconFont}
            dark={dark}
          />
          {subtitle && (
            <View style={styles.subheaderContainer}>
              <Text>{subtitle}</Text>
              <View spacer={true} large={true} />
            </View>
          )}
        </Animated.View>
      </View>
    );
  }
}
