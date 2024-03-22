import React from "react";
import { StyleSheet, View } from "react-native";

export type WalletCardComponentBaseProps<CardProps> = CardProps & {
  // This dummy prop is to not have an empty type
  // This will be extended later during the development of the wallet components
  _?: never;
};

export const withWalletCardBaseComponent =
  <CardProps, ContentProps extends WalletCardComponentBaseProps<CardProps>>(
    CardContent: React.ComponentType<CardProps>
  ) =>
  (props: ContentProps) =>
    (
      <View style={styles.container}>
        <CardContent {...props} />
      </View>
    );

export type WalletCardBaseComponent<
  CardProps,
  ContentProps extends WalletCardComponentBaseProps<CardProps>
> = ReturnType<typeof withWalletCardBaseComponent<CardProps, ContentProps>>;

const styles = StyleSheet.create({
  container: {
    aspectRatio: 16 / 10
  }
});
