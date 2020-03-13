/**
 * this modal shows a warning to the user that some IO systems (backend side) could
 * not work properly. This is due to avoid user tries to access features or services potentially can't work
 * as expected
 */
import { Button, H2, Text, View } from "native-base";
import * as React from "react";
import { BackHandler, Image, Modal, StyleSheet } from "react-native";
import customVariables from "./theme/variables";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: "center",
    justifyContent: "center",
    marginTop: customVariables.contentPadding,
    padding: customVariables.contentPadding
  },
  imageChecked: {
    alignSelf: "center"
  },
  subTitle: {
    textAlign: "center"
  }
});

export default class ServicesStatusModal extends React.PureComponent {
  public render() {
    return (
      <Modal>
        <View style={styles.container}>
          <React.Fragment>
            <Image
              style={styles.imageChecked}
              source={require("../img/servicesStatus/error-detail-icon.png")}
            />
            <View spacer={true} extralarge={true} />
          </React.Fragment>
          <H2 style={styles.subTitle}>{"Title"}</H2>
          <View spacer={true} />
          <Text>{"Subtitle"}</Text>
          <View spacer={true} />

          <Button
            block={true}
            primary={true}
            disabled={false}
            onPress={BackHandler.exitApp}
          >
            <Text>{"press me"}</Text>
          </Button>
        </View>
      </Modal>
    );
  }
}
