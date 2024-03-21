import React from "react";
import { StyleSheet, View } from "react-native";

export type WalletCardComponentBaseProps = {
  // Dummy prop to make
  _?: never;
};

export const withWalletCardBaseComponent =
  <P extends WalletCardComponentBaseProps>(
    CardContent: React.ComponentType<P>
  ) =>
  (props: P) =>
    (
      <View style={styles.card}>
        <CardContent {...(props as P)} />
      </View>
    );

export type WalletCardBaseComponent<
  ContentProps extends WalletCardComponentBaseProps
> = ReturnType<typeof withWalletCardBaseComponent<ContentProps>>;

const styles = StyleSheet.create({
  card: {
    aspectRatio: 16 / 10
  }
});
