import { Container } from "native-base";
import * as React from "react";
import { Linking, Platform } from "react-native";
import { ActivityIndicator, StyleSheet } from "react-native";
import { connect } from "react-redux";

import { NavigationScreenProp, NavigationState } from "react-navigation";
import ROUTES from "../navigation/routes";
import { applicationInitialized } from "../store/actions/application";
import { ReduxProps } from "../store/actions/types";
import variables from "../theme/variables";

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = ReduxProps & OwnProps;

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
class IngressScreen extends React.Component<Props, never> {
  public componentDidMount() {
    // Dispatch APPLICATION_INITIALIZED to start the Startup saga
    this.props.dispatch(applicationInitialized());

    if (Platform.OS === "android") {
      Linking.getInitialURL().then(this.navigate);
    } else {
      Linking.addEventListener("url", this.handleOpenURL);
    }
  }

  public componentWillUnmount() {
    Linking.removeEventListener("url", this.handleOpenURL);
  }

  private handleOpenURL = (event: { url: string }) => {
    this.navigate(event.url);
  };

  private navigate = (url: string | null) => {
    if (!url) {
      return;
    }

    const route = url.slice(ROUTES.PREFIX.length);
    const routeParts = route.split("/");
    const routeName = routeParts[0];
    const id = routeParts[1] || undefined;

    this.props.navigation.navigate(routeName, { id });
  };

  public render() {
    return (
      <Container style={styles.container}>
        <ActivityIndicator color={variables.brandPrimaryInverted} />
      </Container>
    );
  }
}

export default connect()(IngressScreen);
