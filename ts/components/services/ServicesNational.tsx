import React from "react";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import ServiceList from "./ServiceList";

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
 * A component to render a list of national services.
 */
class ServicesNational extends React.PureComponent<Props> {
  public render() {
    const { animated } = this.props;
    return <ServiceList {...this.props} animated={animated} />;
  }
}

export default ServicesNational;
