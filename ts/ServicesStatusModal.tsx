import I18n from "i18n-js";
import { Millisecond } from "italia-ts-commons/lib/units";
import { Button, H2, Text, View, Content } from "native-base";
import * as React from "react";
import { Image, Modal, StyleSheet } from "react-native";
import customVariables from "./theme/variables";

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    marginTop: customVariables.contentPadding,
    padding: customVariables.contentPadding
  },
  imageChecked: {
    alignSelf: "center"
  },
  emailTitle: {
    textAlign: "center"
  },
  textDanger: {
    marginTop: customVariables.contentPadding,
    fontSize: 18,
    textAlign: "center",
    color: customVariables.brandDanger
  }
});

export default class ServicesStatusModal extends React.PureComponent {
  public render() {
    return (
      <Modal>
        <Content style={styles.container}>
          <React.Fragment>
            <Image
              style={styles.imageChecked}
              source={require("../img/servicesStatus/error-detail-icon.png")}
            />
            <View spacer={true} extralarge={true} />
          </React.Fragment>
          <H2 style={styles.emailTitle}>
            {I18n.t("wallet.alert.titlePagoPaUpdateApp")}
          </H2>
          <View spacer={true} />
          <Text>{I18n.t("wallet.alert.messagePagoPaUpdateApp")}</Text>
          <View spacer={true} />

          <Button
            block={true}
            primary={true}
            disabled={false}
            onPress={undefined}
          >
            <Text>{I18n.t("wallet.alert.btnUpdateApp")}</Text>
          </Button>
        </Content>
      </Modal>
    );
  }
}
