import { IOColors, useIOTheme } from "@pagopa/io-app-design-system";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { getServiceActionsProps } from "../utils";
import { ServiceDetailsScreenBase } from "../types";

export type ServiceDetailsScreenDefaultProps = ServiceDetailsScreenBase;

export const ServiceDetailsScreenDefault = ({
  children,
  ctas,
  onPressCta,
  title = ""
}: ServiceDetailsScreenDefaultProps) => {
  const theme = useIOTheme();
  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();

  useHeaderSecondLevel({
    backgroundColor: IOColors[theme["appBackground-secondary"]],
    enableDiscreteTransition: true,
    animatedRef: animatedScrollViewRef,
    supportRequest: true,
    title
  });

  const actions = getServiceActionsProps(undefined, ctas, onPressCta);

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
