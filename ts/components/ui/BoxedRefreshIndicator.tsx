import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { LoadingIndicator } from "./LoadingIndicator";

const styles = StyleSheet.create({
  refreshBox: {
    height: 100,
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

type Props = {
  action?: ReactNode;
  caption?: ReactNode;
};

const BoxedRefreshIndicator = ({ action, caption }: Props) => (
  <View style={styles.refreshBox}>
    <LoadingIndicator testID="refreshIndicator" />
    {caption ? caption : null}
    {action ? action : null}
  </View>
);

export default BoxedRefreshIndicator;
