import { IOColors, useIOTheme } from "@pagopa/io-app-design-system";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useSpecialCtaCgn } from "../../../bonus/cgn/hooks/useSpecialCtaCgn";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { getServiceActionsProps } from "../utils";
import { ServiceDetailsScreenBase } from "../types";
import { ServiceId } from "../../../../../definitions/services/ServiceId";

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
  const theme = useIOTheme();
  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();

  useHeaderSecondLevel({
    backgroundColor: IOColors[theme["appBackground-secondary"]],
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
