import { View } from "native-base";
import React from "react";
import {
  Animated,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent
} from "react-native";

type AnimatedProps = {
  animated?: {
    onScroll: (_: NativeSyntheticEvent<NativeScrollEvent>) => void;
    scrollEventThrottle?: number;
  };
};

type OwnProps = {
  ListEmptyComponent?: React.ComponentProps<
    typeof FlatList
  >["ListEmptyComponent"];
};

type Props = OwnProps & AnimatedProps;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

class ServiceList extends React.Component<Props> {
  private flatListRef = React.createRef<typeof AnimatedFlatList>();

  private renderItem = () => {
    return <View />;
  };

  public render() {
    const { animated, ListEmptyComponent } = this.props;

    return (
      <React.Fragment>
        <AnimatedFlatList
          ref={this.flatListRef}
          scrollEnabled={true}
          scrollEventThrottle={
            animated ? animated.scrollEventThrottle : undefined
          }
          ListEmptyComponent={ListEmptyComponent}
          renderItem={this.renderItem}
          onScroll={animated ? animated.onScroll : undefined}
        />
      </React.Fragment>
    );
  }
}

export default ServiceList;
