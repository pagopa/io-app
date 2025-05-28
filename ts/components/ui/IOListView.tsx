/* eslint-disable sonarjs/cognitive-complexity */

import {
  IOColors,
  IOSpacingScale,
  IOVisualCostants,
  hexToRgba,
  useIOTheme
} from "@pagopa/io-app-design-system";

import { ComponentProps, ReactElement, useState } from "react";

import {
  ColorValue,
  LayoutChangeEvent,
  LayoutRectangle,
  ListRenderItemInfo,
  RefreshControl,
  StyleSheet,
  View
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Animated, { AnimatedRef } from "react-native-reanimated";

import { useFooterActionsMargin } from "../../hooks/useFooterActionsMargin";
import { useScrollHeaderAnimation } from "../../hooks/useScrollHeaderAnimation";
import {
  IOScrollView,
  IOScrollViewActions,
  renderActionButtons
} from "./IOScrollView";

export type IOListViewActions = IOScrollViewActions;

type IOListView<T> = ComponentProps<typeof IOScrollView> &
  ComponentProps<typeof Animated.FlatList<T>> & {
    data: Array<T>;
    renderItem: (item: ListRenderItemInfo<T>) => ReactElement | null;
    keyExtractor: ((item: T, index: number) => string) | undefined;
    animatedRef?: AnimatedRef<Animated.FlatList<T>>;
    skeleton?: ReactElement;
    loading?: boolean;
  };

/* Extended gradient area above the actions */
const gradientSafeAreaHeight: IOSpacingScale = 96;
/* End content margin before the actions */
const contentEndMargin: IOSpacingScale = 32;
/* Extra bottom margin for iPhone bottom handle because
  Link variant doesn't have a fixed height */
const extraSafeAreaMargin: IOSpacingScale = 8;

const styles = StyleSheet.create({
  gradientBottomActions: {
    width: "100%",
    position: "absolute",
    bottom: 0,
    justifyContent: "flex-end"
  },
  gradientContainer: {
    ...StyleSheet.absoluteFillObject
  },
  buttonContainer: {
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    width: "100%",
    flexShrink: 0
  },
  centerContentWrapper: {
    flexGrow: 1,
    alignItems: "stretch",
    justifyContent: "center",
    alignContent: "center"
  }
});

/**
 * The main scrollable container component.
 * It includes full support for custom headers and actions.
 *
 * @param [headerConfig] Configuration for the header component. Use this only if you need to configure a custom header from scratch.
 * If you need the predefined configuration with default `Back (<)` and `Help (?)` buttons, use `useHeaderSecondLevel`
 * @param {IOListViewActions} [actions] Actions to be rendered at the bottom of the `FlatList`
 * @param [animatedRef] Ref generated through `useAnimatedRef` (used by `useFlatListOffset` to get the scroll position)
 * @param {number} [snapOffset] Offset when you need to add a snap point
 * @param {boolean} [excludeSafeAreaMargins=false] Exclude safe area margins at the bottom of the `FlatList`
 * This is useful if you have a screen with a tab bar at the bottom, or if the bottom margin is already being managed
 * @param {boolean} [excludeEndContentMargin=false] Exclude the end content margin
 * @param {boolean} [includeContentMargins=true] Include horizontal screen margins
 * @param {boolean} [debugMode=false] Enable debug mode. Only for testing purposes
 */
export const IOListView = <T,>({
  headerConfig,
  data,
  renderItem,
  keyExtractor,
  actions,
  snapOffset,
  excludeSafeAreaMargins = false,
  excludeEndContentMargin = false,
  includeContentMargins = true,
  debugMode = false,
  animatedRef,
  centerContent,
  refreshControlProps,
  contentContainerStyle,
  ListHeaderComponent,
  ListFooterComponent,
  ListEmptyComponent,
  skeleton,
  ItemSeparatorComponent,
  testID,
  loading
}: IOListView<T>) => {
  const theme = useIOTheme();

  /* Total height of actions */
  const [actionBlockHeight, setActionBlockHeight] =
    useState<LayoutRectangle["height"]>(0);

  const getActionBlockHeight = (event: LayoutChangeEvent) => {
    setActionBlockHeight(event.nativeEvent.layout.height);
  };

  const { bottomMargin, needSafeAreaMargin } = useFooterActionsMargin(
    excludeSafeAreaMargins
  );

  /* GENERATE EASING GRADIENT
       Background color should be app main background
       (both light and dark themes) */
  const HEADER_BG_COLOR: ColorValue = IOColors[theme["appBackground-primary"]];

  /* When the secondary action is visible, add extra margin
       to avoid little space from iPhone bottom handle */
  const extraBottomMargin =
    actions?.secondary && needSafeAreaMargin ? extraSafeAreaMargin : 0;

  /* Safe background block. Cover at least 85% of the space
       to avoid glitchy elements underneath */
  const safeBackgroundBlockHeight = (bottomMargin + actionBlockHeight) * 0.85;

  /* Total height of "Actions + Gradient" area */
  const gradientAreaHeight =
    bottomMargin + actionBlockHeight + gradientSafeAreaHeight;

  /* Height of the safe bottom area, applied to the ScrollView:
       Actions + Content end margin */
  const safeBottomAreaHeight =
    bottomMargin + actionBlockHeight + contentEndMargin;

  const { colors, handleScroll, locations, opacityTransition } =
    useScrollHeaderAnimation({ snapOffset, headerConfig });

  const RefreshControlComponent = refreshControlProps && (
    <RefreshControl {...refreshControlProps} />
  );

  return (
    <Animated.FlatList<T>
      ListHeaderComponent={ListHeaderComponent}
      ItemSeparatorComponent={ItemSeparatorComponent}
      ref={animatedRef}
      keyExtractor={keyExtractor}
      data={data}
      renderItem={item =>
        // If the refresh control is active, show the skeleton (if present) instead of the content
        loading || refreshControlProps?.refreshing
          ? skeleton ?? null
          : renderItem(item)
      }
      testID={testID}
      onScroll={handleScroll}
      ListEmptyComponent={
        (loading || refreshControlProps?.refreshing) && skeleton
          ? skeleton
          : ListEmptyComponent
      }
      refreshing={refreshControlProps?.refreshing}
      scrollEventThrottle={8}
      snapToOffsets={
        // If there is a refresh control, don't snap to offsets
        // This is a react-native bug: https://github.com/facebook/react-native/issues/27324
        RefreshControlComponent ? undefined : [0, snapOffset ?? 0]
      }
      snapToEnd={false}
      decelerationRate="normal"
      refreshControl={RefreshControlComponent}
      centerContent={centerContent}
      ListFooterComponent={
        <>
          {ListFooterComponent}
          {actions && (
            <View
              style={[
                styles.gradientBottomActions,
                {
                  height: gradientAreaHeight,
                  paddingBottom: bottomMargin
                }
              ]}
              pointerEvents="box-none"
              {...(testID && { testID: `${testID}-actions` })}
            >
              <Animated.View
                style={[
                  styles.gradientContainer,
                  debugMode && {
                    backgroundColor: hexToRgba(IOColors["error-500"], 0.15)
                  }
                ]}
                pointerEvents="none"
              >
                <Animated.View
                  style={[
                    opacityTransition,
                    debugMode && {
                      borderTopColor: IOColors["error-500"],
                      borderTopWidth: 1,
                      backgroundColor: hexToRgba(IOColors["error-500"], 0.4)
                    }
                  ]}
                >
                  <LinearGradient
                    style={{
                      height: gradientAreaHeight - safeBackgroundBlockHeight
                    }}
                    locations={locations}
                    colors={colors}
                  />
                </Animated.View>

                {/* Safe background block. It's added because when you swipe up
                    quickly, the content below is visible for about 100ms. Without this
                    block, the content appears glitchy. */}
                <View
                  style={{
                    bottom: 0,
                    height: safeBackgroundBlockHeight,
                    backgroundColor: HEADER_BG_COLOR
                  }}
                />
              </Animated.View>
              <View
                style={styles.buttonContainer}
                onLayout={getActionBlockHeight}
                pointerEvents="box-none"
              >
                {renderActionButtons(actions, extraBottomMargin)}
              </View>
            </View>
          )}
        </>
      }
      contentContainerStyle={[
        {
          paddingBottom: excludeEndContentMargin
            ? 0
            : actions
            ? safeBottomAreaHeight
            : bottomMargin + contentEndMargin,
          paddingHorizontal: includeContentMargins
            ? IOVisualCostants.appMarginDefault
            : 0,
          ...(contentContainerStyle || {})
        },
        centerContent ? styles.centerContentWrapper : {}
      ]}
    />
  );
};
