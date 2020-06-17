/**
 * A customized Header component.
 */
import { Header, NativeBase, View } from "native-base";
import * as React from "react";
import variables from "../../theme/variables";
import ConnectionBar from "../ConnectionBar";
import { ViewProps } from 'react-native';

type Props = NativeBase.Header & ViewProps;

const AppHeader = (props: React.PropsWithChildren<Props>) => {
  return (
    <View accessible={true}>
      <Header
        androidStatusBarColor={variables.androidStatusBarColor}
        iosBarStyle={"dark-content"}
        {...props}
      />
      <ConnectionBar />
    </View>
  );
};

export default AppHeader;
