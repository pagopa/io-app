import { Option } from "fp-ts/lib/Option";
import React from "react";
import { NativeScrollEvent, NativeSyntheticEvent, View } from "react-native";
import { StyleSheet } from "react-native";
import ServiceList from "./ServiceList";
import { ServicesLocalHeader } from "./ServicesLocalHeader";

type AnimatedProps = {
  animated?: {
    onScroll: (_: NativeSyntheticEvent<NativeScrollEvent>) => void;
    scrollEventThrottle?: number;
  };
  paddingForAnimation: boolean;
  AnimatedCTAStyle?: any;
};

type OwnProps = {
  onChooserAreasOfInterestPress: () => void;
  organizationsFiscalCodesSelected: Option<Set<string>>;
};

type Props = OwnProps & AnimatedProps;

const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1
  }
});

/**
 * A component to render a list of local services.
 */
class ServicesLocal extends React.PureComponent<Props> {
  public render() {
    const {
      animated,
      onChooserAreasOfInterestPress,
      paddingForAnimation,
      organizationsFiscalCodesSelected
    } = this.props;
    return (
      <View style={styles.contentWrapper}>
        <ServicesLocalHeader
          onChooserAreasOfInterestPress={onChooserAreasOfInterestPress}
          paddingForAnimation={paddingForAnimation}
          organizationsFiscalCodesSelected={organizationsFiscalCodesSelected}
        />
        <ServiceList {...this.props} animated={animated} />
      </View>
    );
  }
}

export default ServicesLocal;
