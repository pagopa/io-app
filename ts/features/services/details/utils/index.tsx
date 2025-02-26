import { IOScrollViewActions } from "../../../../components/ui/IOScrollView";
import { CTA, CTAS } from "../../../messages/types/MessageCTA";
import { CtaCategoryType } from "../../common/analytics";

/**
 * This function calculates the actions for the service details screen
 */
export const getServiceActionsProps = (
  specialActionProps?: IOScrollViewActions["primary"],
  ctas?: CTAS,
  onPressCta?: (cta: CTA, ctaCategoryType: CtaCategoryType) => void
): IOScrollViewActions | undefined => {
  if (specialActionProps && ctas?.cta_1 && ctas.cta_2) {
    const { cta_1, cta_2 } = ctas;

    return {
      type: "ThreeButtons",
      primary: specialActionProps,
      secondary: {
        label: cta_1.text,
        accessibilityLabel: cta_1.text,
        onPress: () => onPressCta?.(cta_1, "custom_1")
      },
      tertiary: {
        label: cta_2.text,
        accessibilityLabel: cta_2.text,
        onPress: () => onPressCta?.(cta_2, "custom_2")
      }
    };
  }

  if (specialActionProps && ctas?.cta_1) {
    return {
      type: "TwoButtons",
      primary: specialActionProps,
      secondary: {
        label: ctas.cta_1.text,
        accessibilityLabel: ctas.cta_1.text,
        onPress: () => onPressCta?.(ctas.cta_1, "custom_1")
      }
    };
  }

  if (ctas?.cta_1 && ctas.cta_2) {
    const { cta_1, cta_2 } = ctas;

    return {
      type: "TwoButtons",
      primary: {
        label: cta_1.text,
        accessibilityLabel: cta_1.text,
        onPress: () => onPressCta?.(cta_1, "custom_1")
      },
      secondary: {
        label: cta_2.text,
        accessibilityLabel: cta_2.text,
        onPress: () => onPressCta?.(cta_2, "custom_2")
      }
    };
  }

  if (ctas?.cta_1) {
    const { cta_1 } = ctas;

    return {
      type: "SingleButton",
      primary: {
        label: cta_1.text,
        accessibilityLabel: cta_1.text,
        onPress: () => onPressCta?.(cta_1, "custom_1")
      }
    };
  }

  if (specialActionProps) {
    return {
      type: "SingleButton",
      primary: specialActionProps
    };
  }

  return undefined;
};
