/**
 * This screen allows you to enter the CVC,CVV code to proceed with the payment.
 * Now it is used for Maestro cards.
 */

import { none, Option, some } from "fp-ts/lib/Option";
import { Content, Text } from "native-base";
import * as React from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet
} from "react-native";
import {
  NavigationEvents,
  NavigationScreenProp,
  NavigationState
} from "react-navigation";
import { connect } from "react-redux";
import { LabelledItem } from "../../../components/LabelledItem";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { ScreenContentHeader } from "../../../components/screens/ScreenContentHeader";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import MaskedInput from "../../../components/ui/MaskedInput";
import View from "../../../components/ui/TextWithIcon";
import I18n from "../../../i18n";
import variables from "../../../theme/variables";
import { CreditCardCVC } from "../../../utils/input";

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps;

type State = Readonly<{
  securityCode: Option<string>;
  holder: Option<string>;
}>;

const EMPTY_CARD_SECURITY_CODE = "";

const INITIAL_STATE: State = {
  securityCode: none,
  holder: none
};

const styles = StyleSheet.create({
  whiteBg: {
    backgroundColor: variables.colorWhite
  },

  noLeftMargin: {
    marginLeft: 0
  }
});

class PaymentSecureCodeScreen extends React.Component<Props, State> {
  private securityCodeRef = React.createRef<typeof MaskedInput>();
  constructor(props: Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  private updateSecurityCodeState(value: string) {
    this.setState({
      securityCode:
        value && value !== EMPTY_CARD_SECURITY_CODE ? some(value) : none
    });
  }
  private isValidSecurityCode() {
    return this.state.securityCode
      .map(securityCode => {
        return CreditCardCVC.is(securityCode);
      })
      .toUndefined();
  }
  public render(): React.ReactNode {
    return (
      <BaseScreenComponent
        primary={true}
        goBack={true}
        dark={true}
        headerTitle={I18n.t("wallet.confirmPayment.securityVerification")}
      >
        <View
          style={{
            height: 40,
            width: Dimensions.get("window").width,
            backgroundColor: variables.brandDarkGray
          }}
        >
          <Text>Insert text here</Text>
        </View>
        <NavigationEvents onWillFocus={undefined} />

        <ScrollView style={styles.whiteBg} keyboardShouldPersistTaps="handled">
          <ScreenContentHeader
            title={I18n.t("wallet.confirmPayment.insertCode")}
            icon={require("../../../../img/wallet/cvc-icon.png")}
            // fixed={Platform.OS === "ios"}
          />
          <Content scrollEnabled={false}>
            <LabelledItem
              type={"masked"}
              label={""}
              icon=""
              isValid={this.isValidSecurityCode()}
              inputMaskProps={{
                ref: this.securityCodeRef,
                value: this.state.securityCode.getOrElse(
                  EMPTY_CARD_SECURITY_CODE
                ),
                placeholder: I18n.t("wallet.dummyCard.values.securityCode"),
                keyboardType: "numeric",
                returnKeyType: "done",
                maxLength: 4,
                secureTextEntry: true,
                mask: "[0009]",
                onChangeText: (_, value) => this.updateSecurityCodeState(value)
              }}
            />
            <Text>{I18n.t("wallet.confirmPayment.insertCVC")}</Text>
          </Content>
        </ScrollView>
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={Platform.select({
            ios: 0,
            android: variables.contentPadding
          })}
        >
          {this.renderFooterButtons()}
        </KeyboardAvoidingView>
      </BaseScreenComponent>
    );
  }

  /**
   * Footer
   */
  private renderFooterButtons() {
    const secondaryButtonProps = {
      block: true,
      light: true,
      bordered: true,
      onPress: undefined,
      cancel: true,
      title: I18n.t("global.buttons.cancel")
    };
    const primaryButtonProps = {
      block: true,
      primary: true,
      disabled: false,
      onPress: undefined,
      title: I18n.t("global.buttons.continue")
    };

    return (
      <FooterWithButtons
        type="TwoButtonsInlineThird"
        leftButton={secondaryButtonProps}
        rightButton={primaryButtonProps}
      />
    );
  }
}

export default connect()(PaymentSecureCodeScreen);
