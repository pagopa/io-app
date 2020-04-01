import I18n from "i18n-js";
import { Content, Text, View } from "native-base";
import * as React from "react";
import { Image, ImageSourcePropType, StyleSheet } from "react-native";
import customVariables from "../../theme/variables";
import FooterWithButtons, {
  SingleButton,
  TwoButtonsInlineHalf
} from "../ui/FooterWithButtons";

type Props = Readonly<{
  onRetry: () => void;
  onCancel?: () => void;
  image?: ImageSourcePropType;
  text?: string;
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
  private renderFooterButtons = () => {
    const footerProps1: TwoButtonsInlineHalf = {
      type: "TwoButtonsInlineHalf",
      leftButton: {
        bordered: true,
        title: I18n.t("global.buttons.cancel"),
        onPress: this.props.onCancel
      },
      rightButton: {
        primary: true,
        title: I18n.t("global.buttons.retry"),
        onPress: this.props.onRetry
      }
    };

    const footerProps2: SingleButton = {
      type: "SingleButton",
      leftButton: {
        primary: true,
        title: I18n.t("global.buttons.retry"),
        onPress: this.props.onRetry
      }
    };

    return (
      <FooterWithButtons
        {...(this.props.onCancel ? footerProps1 : footerProps2)}
      />
    );
  };

  public render() {
    return (
      <React.Fragment>
        <Content bounces={false}>
          <View style={styles.center}>
            <View spacer={true} extralarge={true} />
            <Image
              source={
                this.props.image ||
                require("../../../img/wallet/errors/generic-error-icon.png")
              }
            />
            <View spacer={true} />
            <Text bold={true} alignCenter={true} style={styles.errorText}>
              {this.props.text || I18n.t("wallet.errors.GENERIC_ERROR")}
            </Text>
            <View spacer={true} extralarge={true} />
            <View spacer={true} extralarge={true} />
            <Text alignCenter={true} style={styles.errorText2}>
              {I18n.t("wallet.errorTransaction.submitBugText")}
            </Text>
            <View spacer={true} extralarge={true} />
          </View>
        </Content>
        {this.renderFooterButtons()}
      </React.Fragment>
    );
  }
}
