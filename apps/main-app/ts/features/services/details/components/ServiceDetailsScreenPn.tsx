import { IOColors, useIOTheme } from "@pagopa/io-app-design-system";
import Animated, { useAnimatedRef } from "react-native-reanimated";

import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { useSpecialCtaPn } from "../../../pn/hooks/useSpecialCtaPn";
import { ServiceDetailsScreenBase } from "../types";
import { getServiceActionsProps } from "../utils";

export type ServiceDetailsScreenPnProps = ServiceDetailsScreenBase & {
  activate: boolean;
  serviceId: ServiceId;
};

export const ServiceDetailsScreenPn = ({
  activate,
  children,
  serviceId,
  ctas,
  onPressCta,
  title = ""
}: ServiceDetailsScreenPnProps) => {
  const theme = useIOTheme();
  const animatedScrollViewRef = useAnimatedRef<Animated.ScrollView>();

  useHeaderSecondLevel({
    backgroundColor: IOColors[theme["appBackground-secondary"]],
    enableDiscreteTransition: true,
    animatedRef: animatedScrollViewRef,
    supportRequest: true,
    title
  });

  const specialActionProps = useSpecialCtaPn(serviceId, activate);

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
