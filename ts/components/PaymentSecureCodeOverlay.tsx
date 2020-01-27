/**
 * This screen allows the user to enter the CVC/CVV code and, if correct,
 * to proceed with the payment.
 * TODO: simplify the "goBack" managemnt
 *  https://www.pivotaltracker.com/story/show/170929164
 */
import { none, Option, some } from "fp-ts/lib/Option";
import I18n from "i18n-js";
import { Content, Text, View } from "native-base";
import * as React from "react";
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet
} from "react-native";
import { makeFontStyleObject } from "../theme/fonts";
import variables from "../theme/variables";
import { AmountToImporto } from "../utils/amounts";
import { CreditCardCVC } from "../utils/input";
import { LabelledItem } from "./LabelledItem";
import { ScreenContentHeader } from "./screens/ScreenContentHeader";
import TopScreenComponent from "./screens/TopScreenComponent";
import FooterWithButtons from "./ui/FooterWithButtons";
import IconFont from "./ui/IconFont";
import MaskedInput from "./ui/MaskedInput";
import PaymentBannerComponent from "./wallet/PaymentBannerComponent";

type Props = Readonly<{
  onCancel: () => void;
  onContinue: (cvv?: string) => void;
  verifica: any;
}>;

type State = Readonly<{
  securityCode: Option<string>;
}>;

const EMPTY_CARD_SECURITY_CODE = "";

const INITIAL_STATE: State = {
  securityCode: none
};

const styles = StyleSheet.create({
  whiteBg: {
    backgroundColor: variables.colorWhite
  },
  noLeftMargin: {
    marginLeft: 0
  },
  text: {
    paddingLeft: 8,
    ...makeFontStyleObject(Platform.select, variables.headerBodyFontWeight),
    fontSize: variables.headerBodyFontSize
  },
  header: {
    flexDirection: "row",
    marginLeft: -4
  }
});

export default class PaymentSecureCodeOverlay extends React.Component<
  Props,
  State
> {
  private securityCodeRef = React.createRef<typeof MaskedInput>();
  constructor(props: Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  private handleBackPress = () => {
    this.props.onCancel();
    return true;
  };

  public componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
  }

  public componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
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

  // TODO: update GoBackButton to be compatible with light modals
  //
  private customHeaderBody = (
    <View style={styles.header}>
      <IconFont name={"io-back"} onPress={this.props.onCancel} />
      <Text style={styles.text}>
        {I18n.t("wallet.confirmPayment.securityVerification")}
      </Text>
    </View>
  );

  public render(): React.ReactNode {
    const verifica = this.props.verifica;
    const currentAmount = AmountToImporto.encode(
      verifica.importoSingoloVersamento
    );

    return (
      <TopScreenComponent headerBody={this.customHeaderBody}>
        <Content noPadded={true}>
          <PaymentBannerComponent
            currentAmount={currentAmount}
            paymentReason={verifica.causaleVersamento}
            recipient={verifica.enteBeneficiario}
            onCancel={this.props.onCancel}
          />
          <ScrollView
            style={styles.whiteBg}
            keyboardShouldPersistTaps={"handled"}
          >
            <ScreenContentHeader
              title={I18n.t("wallet.confirmPayment.insertCode")}
              icon={require("./../../img/wallet/cvc-icon.png")}
            />
            <Content scrollEnabled={false}>
              <LabelledItem
                type={"masked"}
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
                  onChangeText: (_, value) =>
                    this.updateSecurityCodeState(value)
                }}
              />
              <Text>{I18n.t("wallet.confirmPayment.insertCVC")}</Text>
            </Content>
          </ScrollView>
        </Content>
        <KeyboardAvoidingView
          behavior={"padding"}
          keyboardVerticalOffset={Platform.select({
            ios: 0,
            android: variables.contentPadding
          })}
        >
          {this.renderFooterButtons(
            !(
              this.state.securityCode.isSome() &&
              this.state.securityCode.value.length >= 3
            )
          )}
        </KeyboardAvoidingView>
      </TopScreenComponent>
    );
  }

  /**
   * Footer
   */
  private renderFooterButtons(isValidCode: boolean) {
    const handleOnContinue = () => {
      if (this.state.securityCode.isSome()) {
        this.props.onContinue(this.state.securityCode.value);
      }
    };

    const secondaryButtonProps = {
      block: true,
      light: true,
      bordered: true,
      onPress: this.props.onCancel,
      cancel: true,
      title: I18n.t("global.buttons.cancel")
    };
    const primaryButtonProps = {
      block: true,
      primary: true,
      disabled: isValidCode,
      onPress: handleOnContinue,
      title: I18n.t("global.buttons.continue")
    };

    return (
      <FooterWithButtons
        type={"TwoButtonsInlineThird"}
        leftButton={secondaryButtonProps}
        rightButton={primaryButtonProps}
      />
    );
  }
}
