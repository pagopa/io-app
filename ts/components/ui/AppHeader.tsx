/**
 * A customized Header component.
 */
import { Header, NativeBase } from "native-base";
import * as React from "react";
import { View, ColorValue, ViewProps } from "react-native";
import variables from "../../theme/variables";

type Props = NativeBase.Header & ViewProps & { backgroundColor?: ColorValue };

const AppHeader = (props: React.PropsWithChildren<Props>) => (
  <View>
    <Header
      style={
        props.backgroundColor
          ? { backgroundColor: props.backgroundColor }
          : undefined
      }
      androidStatusBarColor={variables.androidStatusBarColor}
      iosBarStyle={"dark-content"}
      {...props}
    />
  </View>
);

export default AppHeader;
