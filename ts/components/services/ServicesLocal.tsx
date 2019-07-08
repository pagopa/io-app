import React from "react";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import ServiceList from "./ServiceList";
import { ServicesLocalEmpty } from "./ServicesLocalEmpty";

type AnimatedProps = {
  animated?: {
    onScroll: (_: NativeSyntheticEvent<NativeScrollEvent>) => void;
    scrollEventThrottle?: number;
  };
  paddingForAnimation: boolean;
  AnimatedCTAStyle?: any;
};

type Props = AnimatedProps;

const ListEmptyComponent = (paddingForAnimation: boolean) => (
  <ServicesLocalEmpty paddingForAnimation={paddingForAnimation} />
);

/**
 * A component to render a list of local services.
 */
class ServicesLocal extends React.PureComponent<Props> {
  public render() {
    const { animated, paddingForAnimation } = this.props;
    return (
      <ServiceList
        {...this.props}
        ListEmptyComponent={ListEmptyComponent(paddingForAnimation)}
        animated={animated}
      />
    );
  }
}

export default ServicesLocal;
