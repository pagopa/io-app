import { NavigationEvents } from "@react-navigation/compat";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Content, Text as NBText } from "native-base";
import * as React from "react";
import { View, Image, ImageSourcePropType, StyleSheet } from "react-native";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import { WithTestID } from "../../types/WithTestID";
import { setAccessibilityFocus } from "../../utils/accessibility";
import { VSpacer } from "../core/spacer/Spacer";
import { SingleButton, TwoButtonsInlineHalf } from "../ui/BlockButtons";
import FooterWithButtons from "../ui/FooterWithButtons";

type Props = WithTestID<
  Readonly<{
    avoidNavigationEvents?: boolean;
    onRetry: () => void;
    onCancel?: () => void;
    image?: ImageSourcePropType;
    text?: string;
    subText?: string;
    retryButtonTitle?: string;
    cancelButtonTitle?: string;
  }>
>;

const styles = StyleSheet.create({
  center: {
    alignItems: "center"
  },
  contentContainerStyle: { flexGrow: 1, justifyContent: "center" },
  errorText: {
    fontSize: customVariables.fontSize2,
    paddingTop: customVariables.contentPadding
  }
});

export default class GenericErrorComponent extends React.PureComponent<Props> {
  private elementRef = React.createRef<View>();

  private renderFooterButtons = () => {
    const footerProps1: TwoButtonsInlineHalf = {
      type: "TwoButtonsInlineHalf",
      leftButton: {
        bordered: true,
        title: this.props.cancelButtonTitle ?? I18n.t("global.buttons.cancel"),
        onPress: this.props.onCancel
      },
      rightButton: {
        primary: true,
        title: this.props.retryButtonTitle ?? I18n.t("global.buttons.retry"),
        onPress: this.props.onRetry
      }
    };

    const footerProps2: SingleButton = {
      type: "SingleButton",
      leftButton: {
        primary: true,
        title: this.props.retryButtonTitle ?? I18n.t("global.buttons.retry"),
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
    // accessible if undefined (default error subtext) or text length > 0
    const subTextAccessible = pipe(
      this.props.subText,
      O.fromNullable,
      O.fold(
        () => true,
        text => text.length > 0
      )
    );

    return (
      <React.Fragment>
        {this.props.avoidNavigationEvents !== true && (
          <NavigationEvents
            onWillFocus={() => setAccessibilityFocus(this.elementRef)}
          />
        )}
        <Content
          bounces={false}
          testID={this.props.testID}
          contentContainerStyle={styles.contentContainerStyle}
        >
          <View style={styles.center}>
            <VSpacer size={40} />
            <Image
              source={
                this.props.image ||
                require("../../../img/wallet/errors/generic-error-icon.png")
              }
            />
            <VSpacer size={16} />
            <NBText
              bold={true}
              alignCenter={true}
              style={styles.errorText}
              ref={this.elementRef}
            >
              {this.props.text
                ? this.props.text
                : I18n.t("wallet.errors.GENERIC_ERROR")}
            </NBText>

            <NBText alignCenter={true} accessible={subTextAccessible}>
              {this.props.subText !== undefined
                ? this.props.subText
                : I18n.t("wallet.errorTransaction.submitBugText")}
            </NBText>
            <VSpacer size={40} />
          </View>
        </Content>
        {this.renderFooterButtons()}
      </React.Fragment>
    );
  }
}
