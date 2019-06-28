import { Button, Content, Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import IconFont from "../ui/IconFont";

const styles = StyleSheet.create({
  contentWrapper: {
    padding: customVariables.contentPadding,
    paddingBottom: 0
  },
  content: {
    alignItems: "center"
  },
  message: {
    fontSize: customVariables.fontSizeBase,
    textAlign: "left"
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 0
  },
  textButton: {
    paddingLeft: 0,
    paddingRight: 0
  },
  icon: {
    color: customVariables.brandPrimary,
    lineHeight: 24
  }
});

export class ServicesLocalEmpty extends React.PureComponent<{}> {
  public render() {
    return (
      <Content
        style={styles.contentWrapper}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.message}>
          {I18n.t("services.areasOfInterest.selectMessage")}
        </Text>

        <View spacer={true} large={true} />

        <Button small={true} bordered={true} style={styles.button} block={true}>
          <IconFont name="io-plus" style={styles.icon} />
          <Text style={styles.textButton}>
            {I18n.t("services.areasOfInterest.addButton")}
          </Text>
        </Button>

        <View spacer={true} extralarge={true} />

        <Image source={require("../../../img/services/icon-places.png")} />
      </Content>
    );
  }
}
