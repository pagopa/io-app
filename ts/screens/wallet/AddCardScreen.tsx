/**
 * Screen for entering the credit card details
 * (holder, pan, cvc, expiration date)
 */
import { none, Option, some } from "fp-ts/lib/Option";
import { entries, range, size } from "lodash";
import {
  Body,
  Container,
  Content,
  Item,
  Left,
  Right,
  Text,
  View
} from "native-base";
import * as React from "react";
import { FlatList, Image, ScrollView, StyleSheet } from "react-native";
import { Col, Grid } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import GoBackButton from "../../components/GoBackButton";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import { InstabugButtons } from "../../components/InstabugButtons";
import { LabelledItem } from "../../components/LabelledItem";
import { WalletStyles } from "../../components/styles/wallet";
import AppHeader from "../../components/ui/AppHeader";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import { cardIcons } from "../../components/wallet/card/Logo";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { Dispatch } from "../../store/actions/types";
import { storeCreditCardData } from "../../store/actions/wallet/wallets";
import { createLoadingSelector } from "../../store/reducers/loading";
import { GlobalState } from "../../store/reducers/types";
import { CreditCard } from "../../types/pagopa";
import { ComponentProps } from "../../types/react";
import {
  CreditCardCVC,
  CreditCardExpirationMonth,
  CreditCardExpirationYear,
  CreditCardPan
} from "../../utils/input";

type ReduxMappedStateProps = Readonly<{
  isLoading: boolean;
}>;

type ReduxMappedDispatchProps = Readonly<{
  storeCreditCardData: (card: CreditCard) => void;
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps & ReduxMappedStateProps & ReduxMappedDispatchProps;

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
  constructor(props: Props) {
    super(props);
    this.state = {
      pan: none,
      expirationDate: none,
      securityCode: none,
      holder: none
    };
  }

  private submit = (card: CreditCard) => {
    // store data locally and proceed
    // to the recap screen
    this.props.storeCreditCardData(card);
    this.props.navigation.navigate(ROUTES.WALLET_CONFIRM_CARD_DETAILS);
  };

  public render(): React.ReactNode {
    // list of cards to be displayed
    const displayedCards: { [key: string]: any } = {
      MASTERCARD: cardIcons.MASTERCARD,
      MAESTRO: cardIcons.MAESTRO,
      VISA: cardIcons.VISA,
      VISAELECTRON: cardIcons.VISAELECTRON,
      AMEX: cardIcons.AMEX,
      POSTEPAY: cardIcons.POSTEPAY,
      DINER: cardIcons.DINERS
    };

    const primaryButtonPropsFromState = (
      state: State
    ): ComponentProps<typeof FooterWithButtons>["leftButton"] => {
      const maybeCard = getCardFromState(state);
      return {
        block: true,
        primary: true,
        onPress: maybeCard.map(card => () => this.submit(card)).toUndefined(),
        disabled: maybeCard.isNone(),
        title: I18n.t("global.buttons.continue")
      };
    };

    const secondaryButtonProps = {
      block: true,
      light: true,
      onPress: () => this.props.navigation.goBack(),
      title: I18n.t("global.buttons.cancel")
    };

    return (
      <Container>
        <AppHeader>
          <Left>
            <GoBackButton />
          </Left>
          <Body>
            <Text>{I18n.t("wallet.addCardTitle")}</Text>
          </Body>
          <Right>
            <InstabugButtons />
          </Right>
        </AppHeader>

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
              placeholder={I18n.t("wallet.dummyCard.values.holder")}
              inputProps={{
                value: this.state.holder.getOrElse(EMPTY_CARD_HOLDER),
                autoCapitalize: "words"
              }}
              onChangeText={(value: string) =>
                this.setState({
                  holder: value !== EMPTY_CARD_HOLDER ? some(value) : none
                })
              }
            />

            <View spacer={true} />

            <LabelledItem
              type={"masked"}
              label={I18n.t("wallet.dummyCard.labels.pan")}
              icon="io-carta"
              placeholder={I18n.t("wallet.dummyCard.values.pan")}
              inputProps={{
                value: this.state.pan.getOrElse(EMPTY_CARD_PAN),
                keyboardType: "numeric",
                maxLength: 23
              }}
              mask={"[0000] [0000] [0000] [0000] [999]"}
              onChangeText={(_, value) =>
                this.setState({
                  pan: value !== EMPTY_CARD_PAN ? some(value) : none
                })
              }
            />

            <View spacer={true} />
            <Grid>
              <Col>
                <LabelledItem
                  type={"masked"}
                  label={I18n.t("wallet.dummyCard.labels.expirationDate")}
                  icon="io-calendario"
                  placeholder={I18n.t("wallet.dummyCard.values.expirationDate")}
                  inputProps={{
                    value: this.state.expirationDate.getOrElse(
                      EMPTY_CARD_EXPIRATION_DATE
                    ),
                    keyboardType: "numeric"
                  }}
                  mask={"[00]{/}[00]"}
                  onChangeText={(_, value) =>
                    this.setState({
                      expirationDate:
                        value !== EMPTY_CARD_EXPIRATION_DATE
                          ? some(value)
                          : none
                    })
                  }
                />
              </Col>
              <Col style={styles.verticalSpacing} />
              <Col>
                <LabelledItem
                  type={"masked"}
                  label={I18n.t("wallet.dummyCard.labels.securityCode")}
                  icon="io-lucchetto"
                  placeholder={I18n.t("wallet.dummyCard.values.securityCode")}
                  inputProps={{
                    value: this.state.securityCode.getOrElse(
                      EMPTY_CARD_SECURITY_CODE
                    ),
                    keyboardType: "numeric",
                    maxLength: 4,
                    secureTextEntry: true
                  }}
                  mask={"[0009]"}
                  onChangeText={(_, value) =>
                    this.setState({
                      securityCode:
                        value !== EMPTY_CARD_SECURITY_CODE ? some(value) : none
                    })
                  }
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
          leftButton={primaryButtonPropsFromState(this.state)}
          rightButton={secondaryButtonProps}
          inlineHalf={true}
        />
      </Container>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedStateProps => ({
  isLoading: createLoadingSelector(["WALLET_MANAGEMENT_LOAD"])(state)
});

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  storeCreditCardData: (card: CreditCard) => dispatch(storeCreditCardData(card))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLoadingSpinner(AddCardScreen, {}));
