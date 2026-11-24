import Animated, { useAnimatedRef } from "react-native-reanimated";

import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useFeatureColors } from "../../../../hooks/useFeatureColors";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useSpecialCtaCdc } from "../../../bonus/cdc/common/hooks/useSpecialCtaCdc";
import { servicesColors } from "../../common/components/colors";
import { ServiceDetailsScreenBase } from "../types";
import { getServiceActionsProps } from "../utils";

export const ServiceDetailsScreenCdc = ({
  children,
  ctas,
  onPressCta,
  title = ""
}: ServiceDetailsScreenBase) => {
  const { header } = useFeatureColors(servicesColors);
  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();

  useHeaderSecondLevel({
    backgroundColor: header.background,
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
