import { IOAppMargin, WithTestID } from "@io-app/design-system";
import {
  JSXElementConstructor,
  ReactElement,
  Ref,
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

type Nullable<T> = null | T;

type Props<T> = Pick<
  FlatListProps<T>,
  | "contentContainerStyle"
  | "decelerationRate"
  | "initialScrollIndex"
  | "keyExtractor"
  | "onViewableItemsChanged"
  | "pagingEnabled"
  | "scrollEnabled"
  | "snapToAlignment"
  | "style"
  | "viewabilityConfig"
> & {
  /** The component used to render the single item. */
  Component: JSXElementConstructor<T>;
  /** The array used to build the carousel items. */
  data: Array<T>;
  /** The horizontal space between carousel items. */
  itemsGap?: 0 | IOAppMargin;
  /** The number of items displayed simultaneously. */
  itemsPerTime?: number;
};

/**
 * This component renders a carousel of elements from a given `data` entry and a
 * `Component` of your choice. It allows you to define how many items to display
 * at a time, how many space between the rendered elements and other important
 * features inherited from the `FlatList` component.
 */
export const Carousel = <T extends Record<string, unknown>>({
  ref,
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
}: WithTestID<Props<T>> & { ref?: Ref<FlatList<T>> }): ReactElement => {
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
      contentContainerStyle={contentContainerStyle}
      data={data}
      decelerationRate={decelerationRate}
      getItemLayout={getItemLayout}
      horizontal
      initialScrollIndex={initialScrollIndex}
      keyExtractor={keyExtractor}
      onViewableItemsChanged={onViewableItemsChanged}
      pagingEnabled={pagingEnabled}
      ref={ref}
      renderItem={renderItem}
      scrollEnabled={scrollEnabled}
      showsHorizontalScrollIndicator={false}
      snapToAlignment={snapToAlignment}
      snapToInterval={snapToInterval}
      style={[style, styles.box]}
      testID={testID}
      viewabilityConfig={viewabilityConfig}
    />
  );
};

const styles = StyleSheet.create({
  box: { overflow: "visible" }
});
