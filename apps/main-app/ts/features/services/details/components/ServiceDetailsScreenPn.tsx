import { ServiceId } from "@io-app/api-types/generated/definitions/services/ServiceId";
import { IOColorsLegacy, useIOTheme } from "@io-app/design-system";
import Animated, { useAnimatedRef } from "react-native-reanimated";

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
    backgroundColor: IOColorsLegacy[theme["appBackground-secondary"]],
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
