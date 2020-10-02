/**
 * A customized Header component.
 */
import { Header, NativeBase, View } from "native-base";
import * as React from "react";
import { ViewProps } from "react-native";
import variables from "../../theme/variables";
import ConnectionBar from "../ConnectionBar";

type Props = NativeBase.Header & ViewProps;

const AppHeader = (props: React.PropsWithChildren<Props>) => (
  <View>
    <Header
      androidStatusBarColor={variables.androidStatusBarColor}
      iosBarStyle={"dark-content"}
      {...props}
    />
    <ConnectionBar />
  </View>
);

export default AppHeader;
