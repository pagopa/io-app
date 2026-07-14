import { ScaledSize } from "react-native";
import { IOVisualCostants } from "../../../core";
import { ChildrenCoords, DisplayInsets, Placement } from "./types";

export const ARROW_HEIGHT = 14;
export const EMPTY_SPACE = 8;

const ARROW_WIDTH = 24;
const DEFAULT_INSETS: DisplayInsets = {
  top: 0,
  bottom: 0,
  left: IOVisualCostants.appMarginDefault,
  right: IOVisualCostants.appMarginDefault
};

/**
 * @param displayInsets custom display insets
 * @returns An `object` based on `DEFAULT_INSETS` and `displayInsets`
 */
export const getDisplayInsets = (
  displayInsets: Partial<DisplayInsets>
): DisplayInsets => ({ ...DEFAULT_INSETS, ...displayInsets });

/**
 *
 * @param placement The `Tooltip` placement
 * @returns The `Arrow` box `width` and `height` based on `placement` value
 */
export const getArrowBoxByPlacement = (placement: Placement) => {
  switch (placement) {
    case "left":
    case "right":
      return {
        width: ARROW_HEIGHT,
        height: ARROW_WIDTH
      };
    default:
      return {
        height: ARROW_HEIGHT,
        width: ARROW_WIDTH
      };
  }
};

/**
 * A utility function to calculate the `Tooltip` coordinates and dimensions
 * @param placement The `Tooltip` placement in relation of its children
 * @param childrenCoords The measures in screen of the `Tooltip` children
 * @param displayInsets The active display insets
 * @param screenDimensions The dimensions of the device screen
 * @returns The `Tooltip` coordinates
 */
export const getTooltipCoords = (
  placement: Placement,
  childrenCoords: ChildrenCoords,
  displayInsets: DisplayInsets,
  screenDimensions: ScaledSize
) => {
  const { width: screenWidth, height: screenHeight } = screenDimensions;

  switch (placement) {
    case "top":
      return {
        bottom: screenHeight - childrenCoords.y + ARROW_HEIGHT + EMPTY_SPACE,
        left: displayInsets.left,
        width: screenWidth - displayInsets.left - displayInsets.right
      };
    case "bottom":
      return {
        top:
          childrenCoords.y + childrenCoords.height + ARROW_HEIGHT + EMPTY_SPACE,
        left: displayInsets.left,
        width: screenWidth - displayInsets.left - displayInsets.right
      };
    case "left":
      return {
        top: childrenCoords.y,
        left: displayInsets.left,
        width:
          screenWidth -
          (screenWidth - childrenCoords.x) -
          ARROW_HEIGHT -
          displayInsets.left -
          EMPTY_SPACE
      };
    case "right":
      const elementSize =
        childrenCoords.width + childrenCoords.x + ARROW_HEIGHT + EMPTY_SPACE;

      return {
        top: childrenCoords.y,
        left: elementSize,
        width: screenWidth - (elementSize + displayInsets.right)
      };
    // TODO: provide a default center position in case of Tooltip without children
    default:
      return {};
  }
};

/**
 * A utility function to calculate the `Tooltip`'s `Arrow` coordinates
 * @param placement The `Arrow` placement in relation of the `Tooltip` children
 * @param childrenCoords The measures in screen of the `Tooltip` children
 * @param screenDimensions The active display insets
 * @returns The `Tooltip`'s Arrow coordinates
 */
export const getArrowCoords = (
  placement: Placement,
  childrenCoords: ChildrenCoords,
  screenDimensions: ScaledSize
) => {
  const { width: screenWidth, height: screenHeight } = screenDimensions;

  switch (placement) {
    case "top":
      return {
        bottom: screenHeight - childrenCoords.y + EMPTY_SPACE,
        left: childrenCoords.x + childrenCoords.width / 2 - ARROW_WIDTH / 2
      };
    case "bottom":
      return {
        top: childrenCoords.y + childrenCoords.height + EMPTY_SPACE,
        left: childrenCoords.x + childrenCoords.width / 2 - ARROW_WIDTH / 2
      };
    case "left":
      return {
        top: childrenCoords.y,
        left:
          screenWidth -
          (screenWidth - childrenCoords.x) -
          ARROW_HEIGHT -
          EMPTY_SPACE -
          1 // FIXME -> This `-1` is necessary because of the Svg size doesn't match the box size
      };
    case "right":
      return {
        top: childrenCoords.y,
        left: childrenCoords.width + childrenCoords.x + EMPTY_SPACE
      };
    default:
      // TODO: provide a default center position in case of Tooltip without children
      return {};
  }
};

/**
 * A utility function to calculate the `Tooltip` vertical alignment
 * @param placement The `Tooltip` placement in relation of its children
 * @param childrenHeight The `Tooltip`'s children height
 * @param tooltipHeight The `Tooltip`'s height
 * @returns If placement is `left` or `right` it returns the vertical tranlsation to align the `Tooltip` center with its `children` center,
 * otherwise `null` is returned
 */
export const getTooltipVerticalAlignment = (
  placement: Placement,
  childrenHeight: number,
  tooltipHeight?: number
) => {
  if ((placement === "left" || placement === "right") && tooltipHeight) {
    return {
      transform: [
        {
          translateY: -tooltipHeight / 2 + childrenHeight / 2
        }
      ]
    };
  }
  return null;
};

/**
 * A utility function to calculate the `Arrow` vertical alignment
 * @param placement The `Tooltip` placement in relation of its children
 * @param childrenHeight The `Tooltip`'s children height
 */
export const getArrowVerticalAlignment = (
  placement: Placement,
  childrenHeight: number
) => {
  if (placement === "left" || placement === "right") {
    return {
      transform: [
        {
          translateY: -ARROW_WIDTH / 2 + childrenHeight / 2
        }
      ]
    };
  }
  return null;
};

export const isDefined = <T>(v: T) => v !== undefined;
export const isNotZero = (v: number) => v !== 0;
