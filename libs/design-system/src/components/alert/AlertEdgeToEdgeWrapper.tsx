import { ComponentProps, PropsWithChildren } from "react";
import Animated, { LinearTransition } from "react-native-reanimated";
import { WithTestID } from "../../utils/types";
import { AlertEdgeToEdge } from "./AlertEdgeToEdge";

type AlertEdgeToEdgeWrapperProps = PropsWithChildren<
  WithTestID<{
    alertProps?: ComponentProps<typeof AlertEdgeToEdge>;
  }>
>;
export const AlertEdgeToEdgeWrapper = ({
  children,
  alertProps
}: AlertEdgeToEdgeWrapperProps) => (
  <>
    {alertProps && <AlertEdgeToEdge {...alertProps} />}
    <Animated.View layout={LinearTransition} style={{ flex: 1 }}>
      {children}
    </Animated.View>
  </>
);
