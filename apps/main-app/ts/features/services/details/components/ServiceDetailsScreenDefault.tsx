import Animated, { useAnimatedRef } from "react-native-reanimated";

import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useFeatureColors } from "../../../../hooks/useFeatureColors";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { servicesColors } from "../../common/components/colors";
import { ServiceDetailsScreenBase } from "../types";
import { getServiceActionsProps } from "../utils";

export type ServiceDetailsScreenDefaultProps = ServiceDetailsScreenBase;

export const ServiceDetailsScreenDefault = ({
  children,
  ctas,
  onPressCta,
  title = ""
}: ServiceDetailsScreenDefaultProps) => {
  const { header } = useFeatureColors(servicesColors);
  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();

  useHeaderSecondLevel({
    backgroundColor: header.background,
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
