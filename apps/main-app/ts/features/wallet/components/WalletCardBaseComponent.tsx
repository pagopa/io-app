import { WithTestID } from "@io-app/design-system";
import { ComponentType } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition
} from "react-native-reanimated";

// Wallet card base component props, which declares common props that wallet cards must have
export type WalletCardComponentBaseProps<P> = WithTestID<{
  cardProps: P;
  isStacked?: boolean;
}>;

export const withWalletCardBaseComponent =
  <
    CardProps extends object,
    ContentProps extends WalletCardComponentBaseProps<CardProps>
  >(
    CardContent: ComponentType<CardProps>
  ) =>
  ({ cardProps, isStacked = true, testID }: ContentProps) => (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      layout={LinearTransition.duration(200)}
      style={[styles.container, isStacked && styles.containerStacked]}
      testID={testID}
    >
      <CardContent {...cardProps} />
    </Animated.View>
  );

export type WalletCardBaseComponent<
  CardProps extends object = object,
  ContentProps extends WalletCardComponentBaseProps<CardProps> =
    WalletCardComponentBaseProps<CardProps>
> = ReturnType<typeof withWalletCardBaseComponent<CardProps, ContentProps>>;

const styles = StyleSheet.create({
  container: {
    aspectRatio: 16 / 10
  },
  containerStacked: {
    aspectRatio: 16 / 3
  }
});
