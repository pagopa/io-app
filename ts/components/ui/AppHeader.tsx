/**
 * A customized Header component.
 */
import { Header, NativeBase } from "native-base";
import * as React from "react";
import variables from "../../theme/variables";
import ConnectionBar from "../ConnectionBar";

type Props = NativeBase.Header;

const AppHeader: React.SFC<Props> = props => {
  const backgroundColor = props.primary
    ? variables.brandPrimary
    : props.dark
      ? variables.brandDarkGray
      : variables.colorWhite;

  return (
    <React.Fragment>
      <Header
        {...props}
        androidStatusBarColor={backgroundColor}
        iosBarStyle={
          props.primary || props.dark ? "light-content" : "dark-content"
        }
      />
      <ConnectionBar />
    </React.Fragment>
  );
};

export default AppHeader;
