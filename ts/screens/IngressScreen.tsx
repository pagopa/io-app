import { Container } from "native-base";
import * as React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { startApplicationInitialization } from "../store/actions/application";
import { ReduxProps } from "../store/actions/types";
import variables from "../theme/variables";

type Props = ReduxProps;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: variables.brandPrimary
  }
});

/**
 * An ingress screen to choose the real first screen the user must navigate to.
 */
class IngressScreen extends React.PureComponent<Props> {
  public componentDidMount() {
    // Dispatch START_APPLICATION_INITIALIZATION to initialize the app
    this.props.dispatch(startApplicationInitialization);
  }
  public render() {
    return (
      <Container style={styles.container}>
        <ActivityIndicator color={variables.brandPrimaryInverted} />
      </Container>
    );
  }
}

export default connect()(IngressScreen);
