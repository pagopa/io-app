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

type OwnProps = {
  onAddAreasOfInterestPress: () => void;
};

type Props = OwnProps & AnimatedProps;

/**
 * A component to render a list of local services.
 */
class ServicesLocal extends React.PureComponent<Props> {
  private renderListEmptyComponent() {
    const { paddingForAnimation, onAddAreasOfInterestPress } = this.props;
    return (
      <ServicesLocalEmpty
        paddingForAnimation={paddingForAnimation}
        onAddAreasOfInterestPress={onAddAreasOfInterestPress}
      />
    );
  }

  public render() {
    const { animated } = this.props;
    return (
      <ServiceList
        {...this.props}
        ListEmptyComponent={this.renderListEmptyComponent()}
        animated={animated}
      />
    );
  }
}

export default ServicesLocal;
