import { IOColors, useIOTheme } from "@pagopa/io-app-design-system";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useSpecialCtaCdc } from "../../../bonus/cgn/hooks/useSpecialCtaCdc";
import { ServiceDetailsScreenBase } from "../types";
import { getServiceActionsProps } from "../utils";

export type ServiceDetailsScreenCdcProps = ServiceDetailsScreenBase;
// Will be useful when implementing the mixpanel tracking
// & {
// serviceId: ServiceId;
// };

export const ServiceDetailsScreenCdc = ({
  children,
  ctas,
  onPressCta,
  title = ""
}: ServiceDetailsScreenCdcProps) => {
  const theme = useIOTheme();
  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();

  useHeaderSecondLevel({
    backgroundColor: IOColors[theme["appBackground-secondary"]],
    enableDiscreteTransition: true,
    animatedRef: animatedScrollViewRef,
    supportRequest: true,
    title
  });

  const specialActionProps = useSpecialCtaCdc();

  const actions = getServiceActionsProps(specialActionProps, ctas, onPressCta);

  return (
    <IOScrollView
      actions={actions}
      animatedRef={animatedScrollViewRef}
      includeContentMargins={false}
    >
      {children}
    </IOScrollView>
  );
};
