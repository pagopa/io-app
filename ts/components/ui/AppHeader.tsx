import { Header, NativeBase } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import variables from "../../theme/variables";
import ConnectionBar from "../ConnectionBar";

type Props = NativeBase.Header;

const styles = StyleSheet.create({
  header: {
    /* iOS */
    shadowOpacity: 0,
    shadowOffset: {
      height: 0,
      width: 0
    },
    shadowRadius: 0,
    flexDirection: "row"
    /* Android */
    // Android Header's style is {elevation:0} by default
  }
});

/**
 * A customized Header component.
 */
const AppHeader: React.SFC<Props> = props => {
  return (
    <React.Fragment>
      <Header
        androidStatusBarColor={variables.androidStatusBarColor}
        iosBarStyle="dark-content"
        style={styles.header}
        {...props}
      />
      <ConnectionBar />
    </React.Fragment>
  );
};

export default AppHeader;
