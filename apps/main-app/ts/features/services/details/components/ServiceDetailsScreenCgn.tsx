import { ServiceId } from "@io-app/api-types/generated/definitions/services/ServiceId";
import Animated, { useAnimatedRef } from "react-native-reanimated";

import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useFeatureColors } from "../../../../hooks/useFeatureColors";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useSpecialCtaCgn } from "../../../bonus/cgn/hooks/useSpecialCtaCgn";
import { servicesColors } from "../../common/components/colors";
import { ServiceDetailsScreenBase } from "../types";
import { getServiceActionsProps } from "../utils";

export type ServiceDetailsScreenCgnProps = ServiceDetailsScreenBase & {
  serviceId: ServiceId;
};

export const ServiceDetailsScreenCgn = ({
  children,
  serviceId,
  ctas,
  onPressCta,
  title = ""
}: ServiceDetailsScreenCgnProps) => {
  const { header } = useFeatureColors(servicesColors);
  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();

  useHeaderSecondLevel({
    backgroundColor: header.background,
    enableDiscreteTransition: true,
    animatedRef: animatedScrollViewRef,
    supportRequest: true,
    title
  });

  const specialActionProps = useSpecialCtaCgn(serviceId);

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
