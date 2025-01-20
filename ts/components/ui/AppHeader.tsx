/**
 * A customized Header component.
 */

import { IOStyles, IOVisualCostants } from "@pagopa/io-app-design-system";
import { PropsWithChildren } from "react";
import { ColorValue, StatusBar, View, ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import variables from "../../theme/variables";

type Props = ViewProps & {
  backgroundColor?: ColorValue;
  hideSafeArea?: boolean;
};

const AppHeader = (props: PropsWithChildren<Props>) => {
  const { top } = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: props.hideSafeArea ? undefined : top,
        paddingHorizontal: IOVisualCostants.appMarginDefault,
        backgroundColor: props.backgroundColor
      }}
    >
      <StatusBar
        barStyle={"dark-content"}
        backgroundColor={variables.androidStatusBarColor}
      />
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
