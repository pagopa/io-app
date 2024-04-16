import { WithTestID } from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet } from "react-native";
import Animated, { Easing, Layout } from "react-native-reanimated";

// Wallet card base component props, which declares common props that wallet cards must have
export type WalletCardComponentBaseProps<P> = WithTestID<{
  isStacked?: boolean;
  cardProps: P;
}>;

export const withWalletCardBaseComponent =
  <
    CardProps extends object,
    ContentProps extends WalletCardComponentBaseProps<CardProps>
  >(
    CardContent: React.ComponentType<CardProps>
  ) =>
  ({ cardProps, isStacked = false, testID }: ContentProps) =>
    (
      <Animated.View
        testID={testID}
        style={[styles.container, isStacked && styles.containerStacked]}
        layout={Layout.duration(300).easing(Easing.inOut(Easing.exp))}
      >
        <CardContent {...cardProps} />
      </Animated.View>
    );

export type WalletCardBaseComponent<
  CardProps extends object = object,
  ContentProps extends WalletCardComponentBaseProps<CardProps> = WalletCardComponentBaseProps<CardProps>
> = ReturnType<typeof withWalletCardBaseComponent<CardProps, ContentProps>>;

const styles = StyleSheet.create({
  container: {
    aspectRatio: 16 / 10
  },
  containerStacked: {
    aspectRatio: 16 / 3
  }
});
