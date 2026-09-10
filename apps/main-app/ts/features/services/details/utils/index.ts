import { IOScrollViewActions } from "../../../../components/ui/IOScrollView";
import { CTA, CTAS } from "../../../../types/LocalizedCTAs";
import { isDefined } from "../../../../utils/guards";
import { CtaCategoryType } from "../../common/analytics";

/**
 * Generates the action props for the service details screen
 *
 * Priority Order:
 * 1. specialActionProps (always primary)
 * 2. cta_1
 * 3. cta_2 (only if cta_1 exists)
 *
 * @param specialActionProps - Special action button props
 * @param ctas - Localized CTAs
 * @param onPressCta - Callback for CTA press events
 * @returns The action props for the service details screen
 */
export const getServiceActionsProps = (
  specialActionProps?: IOScrollViewActions["primary"],
  ctas?: CTAS,
  onPressCta?: (cta: CTA, ctaCategoryType: CtaCategoryType) => void
): IOScrollViewActions | undefined => {
  const toActionProps = (cta: CTA, category: CtaCategoryType) => ({
    label: cta.text,
    onPress: () => onPressCta?.(cta, category)
  });

  const actions = [
    specialActionProps,
    ctas?.cta_1 ? toActionProps(ctas.cta_1, "custom_1") : undefined,
    ctas?.cta_2 ? toActionProps(ctas.cta_2, "custom_2") : undefined
  ].filter(isDefined);

  switch (actions.length) {
    case 1:
      return {
        type: "SingleButton",
        primary: actions[0]
      };
    case 2:
      return {
        type: "TwoButtons",
        primary: actions[0],
        secondary: actions[1]
      };
    case 3:
      return {
        type: "ThreeButtons",
        primary: actions[0],
        secondary: actions[1],
        tertiary: actions[2]
      };
    default:
      return undefined;
  }
};
