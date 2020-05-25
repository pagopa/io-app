/**
 * Screen for entering the credit card details
 * (holder, pan, cvc, expiration date)
 */
import { none, Option, some } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-pagopa-commons/lib/pagopa";
import { entries, range, size } from "lodash";
import { Content, Item, Text, View } from "native-base";
import * as React from "react";
import { FlatList, Image, ScrollView, StyleSheet } from "react-native";
import { Col, Grid } from "react-native-easy-grid";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { PaymentRequestsGetResponse } from "../../../definitions/backend/PaymentRequestsGetResponse";
import { LabelledItem } from "../../components/LabelledItem";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import MaskedInput from "../../components/ui/MaskedInput";
import { cardIcons } from "../../components/wallet/card/Logo";
import I18n from "../../i18n";
import { navigateToWalletConfirmCardDetails } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { addWalletCreditCardInit } from "../../store/actions/wallet/wallets";
import variables from "../../theme/variables";
import { CreditCard } from "../../types/pagopa";
import { ComponentProps } from "../../types/react";
import {
  CreditCardCVC,
  CreditCardExpirationMonth,
  CreditCardExpirationYear,
  CreditCardPan
} from "../../utils/input";
import { isExpired } from "./../../utils/dates";

type NavigationParams = Readonly<{
  inPayment: Option<{
    rptId: RptId;
    initialAmount: AmountInEuroCents;
    verifica: PaymentRequestsGetResponse;
    idPayment: string;
  }>;
  keyFrom?: string;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = ReturnType<typeof mapDispatchToProps> & OwnProps;

type State = Readonly<{
  pan: Option<string>;
  expirationDate: Option<string>;
  securityCode: Option<string>;
  holder: Option<string>;
}>;

const styles = StyleSheet.create({
  noBottomLine: {
    borderBottomWidth: 0
  },

  addCardImage: {
    width: 60,
    height: 45,
    resizeMode: "contain",
    marginTop: 5
  },

  verticalSpacing: {
    width: 16,
    flex: 0
  },

  whiteBg: {
    backgroundColor: variables.colorWhite
  }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.saveCard.contextualHelpTitle",
  body: "wallet.saveCard.contextualHelpContent"
};

const CARD_LOGOS_COLUMNS = 4;
const EMPTY_CARD_HOLDER = "";
const EMPTY_CARD_PAN = "";
const EMPTY_CARD_EXPIRATION_DATE = "";
const EMPTY_CARD_SECURITY_CODE = "";

const INITIAL_STATE: State = {
  pan: none,
  expirationDate: none,
  securityCode: none,
  holder: none
};

function getCardFromState(state: State): Option<CreditCard> {
  const { pan, expirationDate, securityCode, holder } = state;
  if (
    pan.isNone() ||
    expirationDate.isNone() ||
    securityCode.isNone() ||
    holder.isNone()
  ) {
    return none;
  }

  const [expirationMonth, expirationYear] = expirationDate.value.split("/");

  if (!CreditCardPan.is(pan.value)) {
    // invalid pan
    return none;
  }

  if (
    !CreditCardExpirationMonth.is(expirationMonth) ||
    !CreditCardExpirationYear.is(expirationYear)
  ) {
    // invalid date
    return none;
  }

  if (!CreditCardCVC.is(securityCode.value)) {
    // invalid cvc
    return none;
  }

  const card: CreditCard = {
    pan: pan.value,
    holder: holder.value,
    expireMonth: expirationMonth,
    expireYear: expirationYear,
    securityCode: securityCode.value
  };

  return some(card);
}

// list of cards to be displayed
const displayedCards: { [key: string]: any } = {
  MASTERCARD: cardIcons.MASTERCARD,
  VISA: cardIcons.VISA,
  VISAELECTRON: cardIcons.VISAELECTRON,
  POSTEPAY: cardIcons.POSTEPAY,
  AMEX: cardIcons.AMEX
};

class AddCardScreen extends React.Component<Props, State> {
  private panRef = React.createRef<typeof MaskedInput>();
  private expirationDateRef = React.createRef<typeof MaskedInput>();
  private securityCodeRef = React.createRef<typeof MaskedInput>();

  constructor(props: Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  public render(): React.ReactNode {
    const primaryButtonPropsFromState = (
      state: State
    ): ComponentProps<typeof FooterWithButtons>["leftButton"] => {
      const baseButtonProps = {
        block: true,
        primary: true,
        title: I18n.t("global.buttons.continue")
      };
      const maybeCard = getCardFromState(state);
      if (maybeCard.isSome()) {
        return {
          ...baseButtonProps,
          disabled: false,
          onPress: () =>
            this.props.navigateToConfirmCardDetailsScreen(maybeCard.value)
        };
      } else {
        return {
          ...baseButtonProps,
          disabled: true,
          onPress: () => undefined
        };
      }
    };

    const secondaryButtonProps = {
      block: true,
      bordered: true,
      onPress: () => this.props.navigation.goBack(),
      title: I18n.t("global.buttons.back")
    };

    const paddedDisplayedCards = entries(displayedCards).concat(
      // padding with empty items so as to have a # of cols
      // divisible by CARD_LOGOS_COLUMNS (to line them up properly)
      range(
        CARD_LOGOS_COLUMNS - (size(displayedCards) % CARD_LOGOS_COLUMNS)
      ).map(_ => ["", undefined])
    );

    return (
      <BaseScreenComponent
        goBack={true}
        headerTitle={I18n.t("wallet.addCardTitle")}
        contextualHelpMarkdown={contextualHelpMarkdown}
        faqCategories={["wallet_methods"]}
      >
        <ScrollView
          bounces={false}
          style={styles.whiteBg}
          keyboardShouldPersistTaps="handled"
        >
          <Content scrollEnabled={false}>
            <LabelledItem
              type={"text"}
              label={I18n.t("wallet.dummyCard.labels.holder")}
              icon="io-titolare"
              isValid={
                this.state.holder.getOrElse(EMPTY_CARD_HOLDER) === ""
                  ? undefined
                  : true
              }
              inputProps={{
                value: this.state.holder.getOrElse(EMPTY_CARD_HOLDER),
                placeholder: I18n.t("wallet.dummyCard.values.holder"),
                autoCapitalize: "words",
                keyboardType: "default",
                returnKeyType: "done",
                onChangeText: (value: string) => this.updateHolderState(value)
              }}
            />

            <View spacer={true} />

            <LabelledItem
              type={"masked"}
              label={I18n.t("wallet.dummyCard.labels.pan")}
              icon="io-carta"
              isValid={this.isValidPan()}
              inputMaskProps={{
                ref: this.panRef,
                value: this.state.pan.getOrElse(EMPTY_CARD_PAN),
                placeholder: I18n.t("wallet.dummyCard.values.pan"),
                keyboardType: "numeric",
                returnKeyType: "done",
                maxLength: 23,
                mask: "[0000] [0000] [0000] [0000] [999]",
                onChangeText: (_, value) => {
                  this.updatePanState(value);
                }
              }}
            />

            <View spacer={true} />
            <Grid>
              <Col>
                <LabelledItem
                  type={"masked"}
                  label={I18n.t("wallet.dummyCard.labels.expirationDate")}
                  icon="io-calendario"
                  isValid={this.isValidExpirationDate()}
                  inputMaskProps={{
                    ref: this.expirationDateRef,
                    value: this.state.expirationDate.getOrElse(
                      EMPTY_CARD_EXPIRATION_DATE
                    ),
                    placeholder: I18n.t(
                      "wallet.dummyCard.values.expirationDate"
                    ),
                    keyboardType: "numeric",
                    returnKeyType: "done",
                    mask: "[00]{/}[00]",
                    onChangeText: (_, value) =>
                      this.updateExpirationDateState(value)
                  }}
                />
              </Col>
              <Col style={styles.verticalSpacing} />
              <Col>
                <LabelledItem
                  type={"masked"}
                  label={I18n.t("wallet.dummyCard.labels.securityCode")}
                  icon="io-lucchetto"
                  isValid={this.isValidSecurityCode()}
                  inputMaskProps={{
                    ref: this.securityCodeRef,
                    value: this.state.securityCode.getOrElse(
                      EMPTY_CARD_SECURITY_CODE
                    ),
                    placeholder: I18n.t("wallet.dummyCard.values.securityCode"),
                    returnKeyType: "done",
                    maxLength: 4,
                    mask: "[0009]",
                    keyboardType: "numeric",
                    secureTextEntry: true,
                    // Android only
                    isNumericSecureKeyboard: true,
                    onChangeText: (_, value) =>
                      this.updateSecurityCodeState(value)
                  }}
                />
              </Col>
            </Grid>

            <View spacer={true} />
            <Item style={styles.noBottomLine}>
              <Text>{I18n.t("wallet.acceptedCards")}</Text>
            </Item>
            <Item last={true} style={styles.noBottomLine}>
              <FlatList
                numColumns={CARD_LOGOS_COLUMNS}
                data={paddedDisplayedCards}
                renderItem={({ item }) => (
                  <View style={{ flex: 1, flexDirection: "row" }}>
                    {item[1] && (
                      <Image style={styles.addCardImage} source={item[1]} />
                    )}
                  </View>
                )}
                keyExtractor={item => item[0]}
              />
            </Item>
          </Content>
        </ScrollView>

        <FooterWithButtons
          type="TwoButtonsInlineHalf"
          leftButton={secondaryButtonProps}
          rightButton={primaryButtonPropsFromState(this.state)}
        />
      </BaseScreenComponent>
    );
  }

  private isValidPan() {
    return this.state.pan
      .map(pan => {
        return CreditCardPan.is(pan);
      })
      .toUndefined();
  }

  private isValidExpirationDate() {
    return this.state.expirationDate
      .map(expirationDate => {
        const [expirationMonth, expirationYear] = expirationDate.split("/");
        return (
          CreditCardExpirationMonth.is(expirationMonth) &&
          CreditCardExpirationYear.is(expirationYear) &&
          !isExpired(Number(expirationMonth), Number(expirationYear))
        );
      })
      .toUndefined();
  }

  private isValidSecurityCode() {
    return this.state.securityCode
      .map(securityCode => {
        return CreditCardCVC.is(securityCode);
      })
      .toUndefined();
  }

  private updateHolderState(value: string) {
    this.setState({
      holder: value !== EMPTY_CARD_HOLDER ? some(value) : none
    });
  }

  private updatePanState(value: string) {
    this.setState({
      pan: value && value !== EMPTY_CARD_PAN ? some(value) : none
    });
  }

  private updateExpirationDateState(value: string) {
    this.setState({
      expirationDate:
        value && value !== EMPTY_CARD_EXPIRATION_DATE ? some(value) : none
    });
  }

  private updateSecurityCodeState(value: string) {
    this.setState({
      securityCode:
        value && value !== EMPTY_CARD_SECURITY_CODE ? some(value) : none
    });
  }
}

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => ({
  addWalletCreditCardInit: () => dispatch(addWalletCreditCardInit()),
  navigateToConfirmCardDetailsScreen: (creditCard: CreditCard) =>
    dispatch(
      navigateToWalletConfirmCardDetails({
        creditCard,
        inPayment: props.navigation.getParam("inPayment"),
        keyFrom: props.navigation.getParam("keyFrom")
      })
    )
});

export default connect(
  undefined,
  mapDispatchToProps
)(AddCardScreen);
