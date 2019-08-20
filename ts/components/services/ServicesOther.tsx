// TODO: delete this component (bieng substituted with the generic ServicesSectionsList)

import React from "react";
import { NativeScrollEvent, NativeSyntheticEvent, View } from "react-native";

type AnimatedProps = {
  animated?: {
    onScroll: (_: NativeSyntheticEvent<NativeScrollEvent>) => void;
    scrollEventThrottle?: number;
  };
  paddingForAnimation: boolean;
  AnimatedCTAStyle?: any;
};

type Props = AnimatedProps;

/**
 * A component to render a list of other services.
 */
class ServicesOther extends React.PureComponent<Props> {
  public render() {
    // TODO To implement in story https://www.pivotaltracker.com/story/show/166818256
    return <View />;
  }
}

export default ServicesOther;
