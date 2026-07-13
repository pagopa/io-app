import {
  JSXElementConstructor,
  PropsWithChildren,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  Dimensions,
  LayoutChangeEvent,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  View
} from "react-native";
import Animated, { Easing, FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIOTheme, useIOThemeContext } from "../../context";
import { IOColors } from "../../core/IOColors";
import { IconButton } from "../buttons";
import { Body, H6 } from "../typography";
import { BottomArrow, LeftArrow, RightArrow, TopArrow } from "./Arrows";
import {
  ARROW_HEIGHT,
  EMPTY_SPACE,
  getArrowBoxByPlacement,
  getArrowCoords,
  getArrowVerticalAlignment,
  getDisplayInsets,
  getTooltipCoords,
  getTooltipVerticalAlignment,
  isDefined,
  isNotZero
} from "./utils";
import {
  ChildrenCoords,
  DisplayInsets,
  Placement,
  TooltipLayout
} from "./utils/types";

const screenDimensions = Dimensions.get("window");
const INITIAL_COORDS: ChildrenCoords = {
  x: 0,
  y: 0,
  width: 0,
  height: 0
};
const ARROWS_BY_PLACEMENT: Record<
  Placement,
  JSXElementConstructor<{ color: string }>
> = {
  top: TopArrow,
  bottom: BottomArrow,
  left: LeftArrow,
  right: RightArrow
};

type CommonProps = {
  /**
   * The title text displayed at the top of the tooltip.
   */
  title: string;
  /**
   * The tooltip text content.
   */
  content: string;
  /**
   * Controls the visibility of the tooltip.
   */
  isVisible: boolean;
  /**
   * Initial tooltip position; can be 'top', 'bottom', 'left', or 'right'.
   * @default top
   */
  placement?: Placement;
  /**
   * Insets for adjusting tooltip position within screen boundaries.
   * @default {}
   */
  displayInsets?: Partial<DisplayInsets>;
  /**
   * Accessibility label for the close icon button.
   */
  closeIconAccessibilityLabel: string;
  /**
   * Determines whether interactions with the tooltip's children are allowed when `isVisible` is set to true.
   * @default false
   */
  childrenInteractionsEnabled?: boolean;
  /**
   *  Callback function triggered when the tooltip is closed.
   */
  onClose: () => void;
};
type CloseWithTapOnBackground = {
  /**
   * Allows closing the tooltip by tapping outside of it.
   */
  allowCloseOnBackgroundTap: true;
  /**
   * Accessibility label for the tooltip background mask.
   */
  backgroundAccessibilityLabel: string;
};
type CloseWithBackgroundTapDisabled = {
  allowCloseOnBackgroundTap?: false;
};
type Props = CommonProps &
  (CloseWithTapOnBackground | CloseWithBackgroundTapDisabled);

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: IOColors.black,
    zIndex: 997
  },
  childrenContainer: {
    position: "absolute",
    zIndex: 1000
  },
  tooltipContainer: {
    position: "absolute",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    zIndex: 2000,
    overflow: "visible"
  },
  arrowContainer: {
    position: "absolute",
    display: "flex",
    zIndex: 3000
  },
  closeIcon: {
    position: "absolute",
    right: 8,
    top: 9 // It's been used `9` instead of `8` to fix accessibility focus order. In this way title is read before close icon.
  }
});

const getChildrenPosition = (childrenCoords: ChildrenCoords) => ({
  top: childrenCoords.y,
  left: childrenCoords.x,
  width: childrenCoords.width,
  height: childrenCoords.height
});

/**
 * Tooltip component that displays a contextual tooltip around its children.
 * The tooltip position is controlled by the `placement` prop and can adjust
 * dynamically if there is insufficient space.
 * @param {Props} props - The component props
 *
 * @returns {ReactElement} A tooltip component rendered around the specified children.
 */
export const Tooltip = ({
  children,
  title,
  content,
  placement: initialPlacement = "top",
  closeIconAccessibilityLabel,
  isVisible,
  displayInsets = {},
  allowCloseOnBackgroundTap,
  childrenInteractionsEnabled = false,
  onClose
}: PropsWithChildren<Props>): ReactElement => {
  const insets = useSafeAreaInsets();
  const [currentPlacement, setCurrentPlacement] =
    useState<Placement>(initialPlacement);
  const [childrenCoords, setChildrenCoords] =
    useState<ChildrenCoords>(INITIAL_COORDS);
  const [tooltipLayout, setTooltipLayout] = useState<TooltipLayout>();
  const childRef = useRef<View>(null);
  const titleRef = useRef<View>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  // Theme
  const theme = useIOTheme();
  const { themeType } = useIOThemeContext();
  const backdropOpacity = themeType === "light" ? 0.4 : 0.8;
  const tooltipBackground = IOColors[theme["appBackground-secondary"]];

  const Arrow = useMemo(
    () => ARROWS_BY_PLACEMENT[currentPlacement],
    [currentPlacement]
  );
  const childrenCoordsValues = Object.values(childrenCoords);
  const isChildrenMeasurementFinished =
    childrenCoordsValues.every(isDefined) &&
    childrenCoordsValues.some(isNotZero);
  const isTooltipMeasurementCompleted = isDefined(tooltipLayout);
  const tooltipVisibility = { opacity: isTooltipMeasurementCompleted ? 1 : 0 };

  /**
   * This function sets the `Tooltip` children coordinates
   */
  const measureChildrenCoords = useCallback(() => {
    if (childRef.current && typeof childRef.current.measure === "function") {
      childRef.current.measure((_, __, width, height, px, py) => {
        const coords = {
          x: px,
          y: py,
          width,
          height
        };
        if (Object.values(coords).every(isDefined)) {
          setChildrenCoords(coords);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      // A new measure is executed every time the `Tooltip` is visible
      // This is required for use within ScrollView components.
      // eslint-disable-next-line functional/immutable-data
      timeoutRef.current = setTimeout(measureChildrenCoords, 100);
    } else {
      setChildrenCoords(INITIAL_COORDS);
      setCurrentPlacement(initialPlacement);
    }

    return () => {
      if (isVisible) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisible, initialPlacement, measureChildrenCoords]);

  /**
   * This function works with `top` and `bottom` placement and sets the current placement to their opposite value
   * if in the selected one there is no space to prompt the tooltip
   */
  const invertPlacementIfNeeded = useCallback(
    (nativeEvent: LayoutChangeEvent["nativeEvent"]) => {
      if (initialPlacement === "top") {
        const hasSpace = nativeEvent.layout.y >= insets.top;

        if (!hasSpace) {
          setCurrentPlacement("bottom");
        }
      }
      if (initialPlacement === "bottom") {
        const remainingSpace =
          screenDimensions.height - nativeEvent.layout.y - insets.bottom;
        const tooltipMinHeight =
          nativeEvent.layout.height + ARROW_HEIGHT + EMPTY_SPACE;
        const hasSpace = remainingSpace >= tooltipMinHeight;

        if (!hasSpace) {
          setCurrentPlacement("top");
        }
      }
    },
    [insets.bottom, insets.top, initialPlacement]
  );

  const handleTooltipOnLayout = useCallback(
    ({ nativeEvent }: LayoutChangeEvent) => {
      invertPlacementIfNeeded(nativeEvent);
      setTooltipLayout(nativeEvent.layout);
    },
    [invertPlacementIfNeeded]
  );

  const handleTapOnBackground = useCallback(() => {
    if (allowCloseOnBackgroundTap) {
      onClose();
    }
  }, [allowCloseOnBackgroundTap, onClose]);

  return (
    <>
      <View
        // This prop is necessary for .measure to work correctly, as explained here: https://github.com/facebook/react-native/issues/29712
        collapsable={false}
        ref={childRef}
      >
        {children}
      </View>
      <Modal transparent visible={isVisible && isChildrenMeasurementFinished}>
        <View
          accessibilityElementsHidden={!childrenInteractionsEnabled}
          importantForAccessibility={
            childrenInteractionsEnabled ? "auto" : "no-hide-descendants"
          }
          pointerEvents={childrenInteractionsEnabled ? "auto" : "box-only"}
          style={[
            styles.childrenContainer,
            getChildrenPosition(childrenCoords)
          ]}
        >
          {children}
        </View>
        <TouchableWithoutFeedback
          accessible={allowCloseOnBackgroundTap}
          accessibilityRole={allowCloseOnBackgroundTap ? "button" : "none"}
          importantForAccessibility={allowCloseOnBackgroundTap ? "yes" : "no"}
          accessibilityElementsHidden={!allowCloseOnBackgroundTap}
          onPress={handleTapOnBackground}
        >
          <Animated.View
            entering={FadeIn.duration(200).easing(Easing.inOut(Easing.quad))}
            // The exiting transition is not visible, due to the component being unmounted
            // before the transition ends. I leave it here for future reference.
            exiting={FadeOut.duration(200).easing(Easing.inOut(Easing.quad))}
          >
            <View
              style={[
                styles.backdrop,
                { opacity: backdropOpacity, height: screenDimensions.height }
              ]}
            />
          </Animated.View>
        </TouchableWithoutFeedback>
        <View
          onLayout={handleTooltipOnLayout}
          style={[
            styles.tooltipContainer,
            { backgroundColor: tooltipBackground },
            getTooltipCoords(
              currentPlacement,
              childrenCoords,
              getDisplayInsets(displayInsets),
              screenDimensions
            ),
            getTooltipVerticalAlignment(
              currentPlacement,
              childrenCoords.height,
              tooltipLayout?.height
            ),
            tooltipVisibility
          ]}
        >
          <H6 ref={titleRef}>{title}</H6>
          <View style={styles.closeIcon}>
            <IconButton
              color="neutral"
              icon="closeSmall"
              accessibilityLabel={closeIconAccessibilityLabel}
              onPress={onClose}
            />
          </View>
          <Body>{content}</Body>
        </View>
        <View
          style={[
            styles.arrowContainer,
            getArrowBoxByPlacement(currentPlacement),
            getArrowCoords(currentPlacement, childrenCoords, screenDimensions),
            getArrowVerticalAlignment(currentPlacement, childrenCoords.height),
            tooltipVisibility
          ]}
        >
          <Arrow color={tooltipBackground} />
        </View>
      </Modal>
    </>
  );
};
