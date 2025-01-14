/**
 * A customized Header component.
 */
import { IOStyles, IOVisualCostants } from "@pagopa/io-app-design-system";
import * as React from "react";
import { ColorValue, View, ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = ViewProps & {
  backgroundColor?: ColorValue;
  hideSafeArea?: boolean;
};

const AppHeader = (props: React.PropsWithChildren<Props>) => {
  const { top } = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: props.hideSafeArea ? undefined : top,
        paddingHorizontal: IOVisualCostants.appMarginDefault,
        backgroundColor: props.backgroundColor
      }}
    >
      <View
        style={{
          ...IOStyles.row,
          alignItems: "center",
          height: IOVisualCostants.headerHeight
        }}
      >
        {props.children}
      </View>
    </View>
  );
};

export default AppHeader;
