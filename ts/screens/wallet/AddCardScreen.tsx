/**
 * Screen for entering the credit card details
 * (holder, pan, cvc, expiration date)
 */
import { none, Option, some } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-pagopa-commons/lib/pagopa";
import { entries, range, size } from "lodash";
import { Content, Item, Text, View } from "native-base";
import * as React from "react";
import {
  AppState,
  AppStateStatus,
  FlatList,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet
} from "react-native";
import { Col, Grid } from "react-native-easy-grid";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";

import { PaymentRequestsGetResponse } from "../../../definitions/backend/PaymentRequestsGetResponse";

import { LabelledItem } from "../../components/LabelledItem";
import { WalletStyles } from "../../components/styles/wallet";
import MaskedInput from "../../components/ui/MaskedInput";

import BaseScreenComponent from "../../components/screens/BaseScreenComponent";

import FooterWithButtons from "../../components/ui/FooterWithButtons";
import { cardIcons } from "../../components/wallet/card/Logo";
import I18n from "../../i18n";
import { navigateToWalletConfirmCardDetails } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { addWalletCreditCardInit } from "../../store/actions/wallet/wallets";
import { CreditCard } from "../../types/pagopa";
import { ComponentProps } from "../../types/react";
import {
  CreditCardCVC,
  CreditCardExpirationMonth,
  CreditCardExpirationYear,
  CreditCardPan
} from "../../utils/input";

type NavigationParams = Readonly<{
  inPayment: Option<{
    rptId: RptId;
    initialAmount: AmountInEuroCents;
    verifica: PaymentRequestsGetResponse;
    idPayment: string;
  }>;
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
  }
});

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

class AddCardScreen extends React.Component<Props, State> {
  private panRef = React.createRef<typeof MaskedInput>();
  private expirationDateRef = React.createRef<typeof MaskedInput>();
  private securityCodeRef = React.createRef<typeof MaskedInput>();

  constructor(props: Props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  public componentDidMount() {
    AppState.addEventListener("change", this.handleAppStateChange);
  }

  public componentWillUnmount() {
    AppState.removeEventListener("change", this.handleAppStateChange);
  }

  public render(): React.ReactNode {
    // list of cards to be displayed
    const displayedCards: { [key: string]: any } = {
      MASTERCARD: cardIcons.MASTERCARD,
      MAESTRO: cardIcons.MAESTRO,
      VISA: cardIcons.VISA,
      VISAELECTRON: cardIcons.VISAELECTRON,
      POSTEPAY: cardIcons.POSTEPAY
    };

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
        Keyboard.dismiss();
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

    return (
      <BaseScreenComponent
        goBack={true}
        headerTitle={I18n.t("wallet.addCardTitle")}
      >
        <ScrollView
          bounces={false}
          style={WalletStyles.whiteBg}
          keyboardShouldPersistTaps="handled"
        >
          <Content scrollEnabled={false}>
            <LabelledItem
              type={"text"}
              label={I18n.t("wallet.dummyCard.labels.holder")}
              icon="io-titolare"
              inputProps={{
                value: this.state.holder.getOrElse(EMPTY_CARD_HOLDER),
                placeholder: I18n.t("wallet.dummyCard.values.holder"),
                autoCapitalize: "words",
                onChangeText: (value: string) =>
                  this.setState({
                    holder: value !== EMPTY_CARD_HOLDER ? some(value) : none
                  })
              }}
            />

            <View spacer={true} />

            <LabelledItem
              type={"masked"}
              label={I18n.t("wallet.dummyCard.labels.pan")}
              icon="io-carta"
              inputMaskProps={{
                ref: this.panRef,
                value: this.state.pan.getOrElse(EMPTY_CARD_PAN),
                placeholder: I18n.t("wallet.dummyCard.values.pan"),
                keyboardType: "numeric",
                maxLength: 23,
                mask: "[0000] [0000] [0000] [0000] [999]",
                onChangeText: (_, value) =>
                  this.setState({
                    pan: value !== EMPTY_CARD_PAN ? some(value) : none
                  })
              }}
            />

            <View spacer={true} />
            <Grid>
              <Col>
                <LabelledItem
                  type={"masked"}
                  label={I18n.t("wallet.dummyCard.labels.expirationDate")}
                  icon="io-calendario"
                  inputMaskProps={{
                    ref: this.expirationDateRef,
                    value: this.state.expirationDate.getOrElse(
                      EMPTY_CARD_EXPIRATION_DATE
                    ),
                    placeholder: I18n.t(
                      "wallet.dummyCard.values.expirationDate"
                    ),
                    keyboardType: "numeric",
                    mask: "[00]{/}[00]",
                    onChangeText: (_, value) =>
                      this.setState({
                        expirationDate:
                          value !== EMPTY_CARD_EXPIRATION_DATE
                            ? some(value)
                            : none
                      })
                  }}
                />
              </Col>
              <Col style={styles.verticalSpacing} />
              <Col>
                <LabelledItem
                  type={"masked"}
                  label={I18n.t("wallet.dummyCard.labels.securityCode")}
                  icon="io-lucchetto"
                  inputMaskProps={{
                    ref: this.securityCodeRef,
                    value: this.state.securityCode.getOrElse(
                      EMPTY_CARD_SECURITY_CODE
                    ),
                    placeholder: I18n.t("wallet.dummyCard.values.securityCode"),
                    keyboardType: "numeric",
                    maxLength: 4,
                    secureTextEntry: true,
                    mask: "[0009]",
                    onChangeText: (_, value) =>
                      this.setState({
                        securityCode:
                          value !== EMPTY_CARD_SECURITY_CODE
                            ? some(value)
                            : none
                      })
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
                data={entries(displayedCards).concat(
                  // padding with empty items so as to have a # of cols
                  // divisible by CARD_LOGOS_COLUMNS (to line them up properly)
                  range(
                    CARD_LOGOS_COLUMNS -
                      (size(displayedCards) % CARD_LOGOS_COLUMNS)
                  ).map((__): [string, any] => ["", undefined])
                )}
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

  private handleAppStateChange = (nextAppStateStatus: AppStateStatus) => {
    if (nextAppStateStatus !== "active") {
      // Clear all the inputs
      this.setState(INITIAL_STATE);
      // For a bug in the `react-native-text-input-mask` library we have to
      // reset the TextInputMask components value calling the clear function,
      if (this.panRef.current) {
        this.panRef.current._root.clear();
      }
      if (this.expirationDateRef.current) {
        this.expirationDateRef.current._root.clear();
      }
      if (this.securityCodeRef.current) {
        this.securityCodeRef.current._root.clear();
      }
    }
  };
}

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => ({
  addWalletCreditCardInit: () => dispatch(addWalletCreditCardInit()),
  navigateToConfirmCardDetailsScreen: (creditCard: CreditCard) =>
    dispatch(
      navigateToWalletConfirmCardDetails({
        creditCard,
        inPayment: props.navigation.getParam("inPayment")
      })
    )
});

export default connect(
  undefined,
  mapDispatchToProps
)(AddCardScreen);
