import * as React from "react";
import { StyleSheet, View } from "react-native";
import { IOColors, LoadingSpinner } from "@pagopa/io-app-design-system";
import { useIOSelector } from "../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../store/reducers/persistedPreferences";
import { RefreshIndicator } from "./RefreshIndicator";

const styles = StyleSheet.create({
  refreshBox: {
    height: 100,
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  whiteBg: {
    backgroundColor: IOColors.white
  }
});

type Props = {
  action?: React.ReactNode;
  caption?: React.ReactNode;
  white?: boolean;
};

const BoxedRefreshIndicator = ({ action, caption, white }: Props) => {
  const isDesignSystemEnabled = useIOSelector(isDesignSystemEnabledSelector);
  return (
    <View style={[styles.refreshBox, white && styles.whiteBg]}>
      {isDesignSystemEnabled ? <LoadingSpinner /> : <RefreshIndicator />}
      {caption ? caption : null}
      {action ? action : null}
    </View>
  );
};

export default BoxedRefreshIndicator;
