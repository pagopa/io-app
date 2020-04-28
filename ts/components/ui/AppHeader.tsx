import { fromNullable } from "fp-ts/lib/Option";
import { Header, NativeBase } from "native-base";
import * as React from "react";
import variables from "../../theme/variables";
import ConnectionBar from "../ConnectionBar";

type Props = NativeBase.Header;

/**
 * A customized Header component.
 */
const AppHeader: React.SFC<Props> = props => {
  const backgroundColor = fromNullable(props.primary).fold(
    fromNullable(props.dark).fold(
      variables.colorWhite,
      _ => variables.brandDarkGray
    ),
    _ => variables.contentPrimaryBackground
  );

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
