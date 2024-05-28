import { IOAppMargin, WithTestID } from "@pagopa/io-app-design-system";
import React, {
  JSXElementConstructor,
  ReactElement,
  Ref,
  forwardRef,
  useCallback,
  useMemo
} from "react";
import {
  Dimensions,
  FlatList,
  FlatListProps,
  StyleSheet,
  View
} from "react-native";

const WINDOW_WIDTH = Dimensions.get("window").width;

type Nullable<T> = T | null;

type Props<T> = {
  data: Array<T>;
  Component: JSXElementConstructor<T>;
  itemsGap?: IOAppMargin | 0;
  screenActivePadding?: number;
  itemsPerTime?: number;
} & Pick<
  FlatListProps<T>,
  | "onViewableItemsChanged"
  | "snapToAlignment"
  | "decelerationRate"
  | "pagingEnabled"
  | "viewabilityConfig"
  | "contentContainerStyle"
  | "initialScrollIndex"
  | "keyExtractor"
  | "scrollEnabled"
  | "style"
>;

function CarouselComponent<T extends Record<string, unknown>>(
  {
    data,
    snapToAlignment,
    decelerationRate,
    pagingEnabled,
    viewabilityConfig,
    contentContainerStyle,
    initialScrollIndex,
    itemsGap = 0,
    itemsPerTime = 1,
    scrollEnabled = true,
    style,
    testID,
    Component,
    onViewableItemsChanged,
    keyExtractor
  }: WithTestID<Props<T>>,
  ref: Ref<FlatList<T>>
) {
  const snapToInterval = useMemo(
    () => WINDOW_WIDTH - itemsGap * itemsPerTime,
    [itemsGap, itemsPerTime]
  );

  const renderItem = useCallback(
    ({ item }: { item: T }) => (
      <View
        style={{
          width:
            data.length === 1 && itemsPerTime === 1
              ? WINDOW_WIDTH
              : WINDOW_WIDTH / itemsPerTime - itemsGap * 2,
          marginRight: itemsGap
        }}
      >
        <Component {...item} />
      </View>
    ),
    [Component, data, itemsGap, itemsPerTime]
  );

  const getItemLayout = useCallback(
    (_: Nullable<ArrayLike<T>> | undefined, index: number) => ({
      length: WINDOW_WIDTH,
      offset: WINDOW_WIDTH * index,
      index
    }),
    []
  );

  return (
    <FlatList
      ref={ref}
      horizontal
      testID={testID}
      data={data}
      style={[style, styles.box]}
      snapToInterval={snapToInterval}
      snapToAlignment={snapToAlignment}
      decelerationRate={decelerationRate}
      pagingEnabled={pagingEnabled}
      viewabilityConfig={viewabilityConfig}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={contentContainerStyle}
      initialScrollIndex={initialScrollIndex}
      scrollEnabled={scrollEnabled}
      renderItem={renderItem}
      getItemLayout={getItemLayout}
      keyExtractor={keyExtractor}
      onViewableItemsChanged={onViewableItemsChanged}
    />
  );
}

const styles = StyleSheet.create({
  box: { overflow: "visible" }
});

export const Carousel = forwardRef(CarouselComponent) as <T>(
  p: WithTestID<Props<T>> & { ref?: Ref<FlatList<T>> }
) => ReactElement;
