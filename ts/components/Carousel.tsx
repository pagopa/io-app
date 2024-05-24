import { IOAppMargin } from "@pagopa/io-app-design-system";
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
    Component,
    onViewableItemsChanged,
    keyExtractor
  }: Props<T>,
  ref: Ref<FlatList<T>>
) {
  const availableWidth = useMemo(() => WINDOW_WIDTH, []);
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
              ? availableWidth
              : availableWidth / itemsPerTime - itemsGap * 2,
          marginRight: itemsGap
        }}
      >
        <Component {...item} />
      </View>
    ),
    [Component, availableWidth, data, itemsGap, itemsPerTime]
  );

  const getItemLayout = useCallback(
    (_: Nullable<ArrayLike<T>> | undefined, index: number) => ({
      length: availableWidth,
      offset: availableWidth * index,
      index
    }),
    [availableWidth]
  );

  return (
    <FlatList
      ref={ref}
      data={data}
      style={[style, styles.box]}
      snapToInterval={snapToInterval}
      onViewableItemsChanged={onViewableItemsChanged}
      snapToAlignment={snapToAlignment}
      decelerationRate={decelerationRate}
      getItemLayout={getItemLayout}
      pagingEnabled={pagingEnabled}
      viewabilityConfig={viewabilityConfig}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={contentContainerStyle}
      initialScrollIndex={initialScrollIndex}
      scrollEnabled={scrollEnabled}
      horizontal
      keyExtractor={keyExtractor}
    />
  );
}

const styles = StyleSheet.create({
  box: { overflow: "visible" }
});

export const Carousel = forwardRef(CarouselComponent) as <T>(
  p: Props<T> & { ref?: Ref<FlatList<T>> }
) => ReactElement;
