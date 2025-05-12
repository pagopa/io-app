import { IOColors, useIOTheme } from "@pagopa/io-app-design-system";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useSpecialCtaCdc } from "../../../bonus/cdc/hooks/useSpecialCtaCdc";
import { ServiceDetailsScreenBase } from "../types";
import { getServiceActionsProps } from "../utils";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";

export type ServiceDetailsScreenCdcProps = ServiceDetailsScreenBase & {
  serviceId: ServiceId;
};

export const ServiceDetailsScreenCdc = ({
  children,
  serviceId,
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

  const specialActionProps = useSpecialCtaCdc(serviceId);

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
