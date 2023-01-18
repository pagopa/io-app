/**
 * This component provides a ScrollView able to:
 * - scroll to top on its focus
 * - provide a dynanic subheader appearing on scroll
 */
import { NavigationEvents } from "@react-navigation/compat";
import * as React from "react";
import {
  View,
  Animated,
  LayoutChangeEvent,
  Platform,
  StyleProp,
  StyleSheet,
  ViewStyle
} from "react-native";

import { isIphoneX } from "react-native-iphone-x-helper";
import customVariables from "../../theme/variables";
import { ComponentProps } from "../../types/react";
import { IOColors } from "../core/variables/IOColors";

import { ScreenContentHeader } from "./ScreenContentHeader";

type OwnProps = Readonly<{
  dynamicSubHeader: React.ReactNode;
  topContentHeight: number;
  animationOffset: number;
  hideHeader?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}>;

type Props = OwnProps & ComponentProps<typeof ScreenContentHeader>;

type State = Readonly<{
  scrollY: Animated.Value;
  dynamicSubHeaderHeight: number;
}>;

const INITIAL_STATE = {
  scrollY: new Animated.Value(0),
  dynamicSubHeaderHeight: 0
};

const styles = StyleSheet.create({
  animatedSubHeader: {
    position: "absolute",
    left: 0,
    right: 0,
    overflow: "hidden"
  },

  level1: {
    zIndex: Platform.OS === "android" ? 1 : -1
  },

  level2: {
    zIndex: Platform.OS === "android" ? 1 : -2
  },

  animatedDarkItem: {
    backgroundColor: IOColors.bluegrey,
    position: "absolute",
    width: "100%",
    zIndex: -5,
    height: 1000,
    marginTop: -800
  }
});

export default class AnimatedScreenContent extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  private scrollableContentRef = React.createRef<any>();

  private scrollToTop = () => {
    this.scrollableContentRef.current
      .getNode()
      .scrollTo({ y: 0, animated: false });
  };

  private headerHeight: number =
    Platform.OS === "ios"
      ? isIphoneX()
        ? customVariables.appHeaderHeight + 62
        : customVariables.appHeaderHeight + 35
      : customVariables.appHeaderHeight;

  public render(): React.ReactNode {
    const { topContentHeight, animationOffset, contentStyle } = this.props;

    /**
     * The object referred as subHeader will be animated at scroll so that
     * - the sub-header will be hidden until the top content will be displayed
     * - the sub-header will appears scrolling from top to bottom covering its height
     * - the velocity of the animation can be managed by setting the desired offset
     */
    const subHeaderTranslation = this.state.scrollY.interpolate({
      inputRange: [
        0,
        topContentHeight - animationOffset,
        topContentHeight + animationOffset
      ],
      outputRange: [
        -this.state.dynamicSubHeaderHeight - this.headerHeight,
        -this.state.dynamicSubHeaderHeight - this.headerHeight,
        0
      ],
      extrapolate: "clamp"
    });

    // On iOS, if the header theme is the dark one, it is used to get
    // a dark background at pull-to-refresh
    const dymanicOffset = this.state.scrollY.interpolate({
      inputRange: [-800, 0, 800],
      outputRange: [800, 0, -800]
    });

    return (
      <React.Fragment>
        {Platform.OS === "ios" && this.props.dark && (
          <Animated.View
            style={[
              styles.animatedDarkItem,
              { transform: [{ translateY: dymanicOffset }] }
            ]}
          />
        )}
        <Animated.ScrollView
          style={[styles.level2, contentStyle]}
          ref={this.scrollableContentRef}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }],
            { useNativeDriver: true }
          )}
        >
          <NavigationEvents onWillFocus={this.scrollToTop} />

          {!this.props.hideHeader && (
            <ScreenContentHeader
              title={this.props.title}
              icon={this.props.icon}
              iconFont={this.props.iconFont}
              dark={this.props.dark}
            />
          )}
          {this.props.children}
        </Animated.ScrollView>

        <Animated.View
          onLayout={(event: LayoutChangeEvent) =>
            this.state.dynamicSubHeaderHeight === 0 &&
            this.setState({
              dynamicSubHeaderHeight: event.nativeEvent.layout.height
            })
          }
          style={[
            styles.level1,
            styles.animatedSubHeader,
            {
              transform: [{ translateY: subHeaderTranslation }]
            }
          ]}
        >
          <View style={{ marginTop: this.headerHeight }}>
            {this.props.dynamicSubHeader}
          </View>
        </Animated.View>
      </React.Fragment>
    );
  }
}
