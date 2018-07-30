import { Body, Button, Container, H1, Left, Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import AppHeader from "../components/ui/AppHeader";
import IconFont from "../components/ui/IconFont";
import { applicationInitialized } from "../store/actions/application";
import { ReduxProps } from "../store/actions/types";

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};
type Props = ReduxProps & OwnProps;

const styles = StyleSheet.create({
  content: {
    alignItems: "center"
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around"
  },
  textCenter: {
    textAlign: "center"
  },
  cancelButton: {
    backgroundColor: "#556d7a"
  }
});

/**
 * An error screen to show messages when something went wrong
 */
class ErrorScreen extends React.Component<Props, never> {
  public componentDidMount() {
    // Dispatch APPLICATION_INITIALIZED to start the Startup saga
    this.props.dispatch(applicationInitialized());
  }

  public render() {
    return (
      <Container>
        <AppHeader>
          <Left>
            <Button transparent={true}>
              <IconFont name="io-back" />
            </Button>
          </Left>
          <Body>
            <Text>Non hai spid?</Text>
          </Body>
        </AppHeader>
        <View content={true} style={styles.content}>
          <View spacer={true} extralarge={true} />
          <Image source={require("../../img/error.png")} />
          <View spacer={true} extralarge={true} />
          <H1 style={styles.textCenter}>
            Ops! Qualcosa non sta funzionando come dovrebbe.
          </H1>
          <View spacer={true} />
          <Text alignCenter={true}>
            Questo testo contiene una descrizione più dettagliata dell'errore.
            Questo testo contiene una descrizione più dettagliata dell'errore.
          </Text>
        </View>
        <View footer={true} style={styles.footer}>
          <View flex={6}>
            <Button block={true} info={true} style={styles.cancelButton}>
              <Text>Annulla</Text>
            </Button>
          </View>
          <View flex={1} />
          <View flex={15}>
            <Button block={true} primary={true}>
              <Text>Riprova</Text>
            </Button>
          </View>
        </View>
      </Container>
    );
  }
}

export default connect()(ErrorScreen);
