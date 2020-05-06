/**
 * A customized Header component.
 */
import { Header, NativeBase } from "native-base";
import * as React from "react";
import variables from "../../theme/variables";
import ConnectionBar from "../ConnectionBar";

type Props = NativeBase.Header;

const AppHeader: React.SFC<Props> = props => {
  return (
    <React.Fragment>
      <Header
        androidStatusBarColor={variables.androidStatusBarColor}
        iosBarStyle={"dark-content"}
        {...props}
      />
      <ConnectionBar />
    </React.Fragment>
  );
};

export default AppHeader;
