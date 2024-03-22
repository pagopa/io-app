import React from "react";
import { StyleSheet, View } from "react-native";

// Wallet card base component props, which declares common props that wallet cards must have
export type WalletCardComponentBaseProps<P> = {
  isStacked: boolean;
  cardProps: P;
};

export const withWalletCardBaseComponent =
  <
    CardProps extends object,
    ContentProps extends WalletCardComponentBaseProps<CardProps>
  >(
    CardContent: React.ComponentType<CardProps>
  ) =>
  ({ cardProps }: ContentProps) =>
    (
      <View style={styles.container}>
        <CardContent {...cardProps} />
      </View>
    );

export type WalletCardBaseComponent<
  CardProps extends object = object,
  ContentProps extends WalletCardComponentBaseProps<CardProps> = WalletCardComponentBaseProps<CardProps>
> = ReturnType<typeof withWalletCardBaseComponent<CardProps, ContentProps>>;

const styles = StyleSheet.create({
  container: {
    aspectRatio: 16 / 10
  }
});
