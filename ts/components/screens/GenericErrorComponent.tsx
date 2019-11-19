import I18n from "i18n-js";
import { Content, Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import customVariables from "../../theme/variables";
import FooterWithButtons from "../ui/FooterWithButtons";

type Props = Readonly<{
  onRetry: () => void;
}>;

const styles = StyleSheet.create({
  center: {
    alignItems: "center"
  },
  errorText: {
    fontSize: customVariables.fontSize2,
    paddingTop: customVariables.contentPadding
  },
  errorText2: {
    fontSize: customVariables.fontSizeSmall
  }
});

export default class GenericErrorComponent extends React.PureComponent<Props> {
  public render() {
    return (
      <React.Fragment>
        <Content bounces={false}>
          <View style={styles.center}>
            <View spacer={true} extralarge={true} />
            <Image
              source={require("../../../img/wallet/errors/generic-error-icon.png")}
            />
            <View spacer={true} />
            <Text bold={true} alignCenter={true} style={styles.errorText}>
              {I18n.t("wallet.errors.GENERIC_ERROR")}
            </Text>
            <View spacer={true} extralarge={true} />
            <View spacer={true} extralarge={true} />
            <Text alignCenter={true} style={styles.errorText2}>
              {I18n.t("wallet.errorTransaction.submitBugText")}
            </Text>
            <View spacer={true} extralarge={true} />
          </View>
        </Content>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={{
            block: true,
            primary: true,
            onPress: this.props.onRetry,
            title: I18n.t("global.buttons.retry")
          }}
        />
      </React.Fragment>
    );
  }
}
