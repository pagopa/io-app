/**
 * Screen for entering the credit card details
 * (holder, pan, cvc, expiration date)
 */
import { none, Option, some } from "fp-ts/lib/Option";
import { entries, range, size } from "lodash";
import { Left } from "native-base";
import { Body, Container, Content, Item, Text, View } from "native-base";
import * as React from "react";
import { FlatList, Image, ScrollView, StyleSheet } from "react-native";
import { Col, Grid } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import GoBackButton from "../../components/GoBackButton";
import { LabelledItem } from "../../components/LabelledItem";
import { WalletStyles } from "../../components/styles/wallet";
import AppHeader from "../../components/ui/AppHeader";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import { cardIcons } from "../../components/wallet/card/Logo";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { fixExpirationDate, fixPan } from "../../utils/input";

type Props = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
}>;

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

export class AddCardScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      pan: none,
      expirationDate: none,
      securityCode: none,
      holder: none
    };
  }

  private onExpirationDateChange = (value: string) => {
    const newValue: Option<string> = fixExpirationDate(value);
    this.setState({ expirationDate: newValue });
  };

  private onPanChange = (value: string) => {
    const newValue: Option<string> = fixPan(value);
    this.setState({ pan: newValue });
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

    const primaryButtonProps = {
      block: true,
      primary: true,
      onPress: () => this.props.navigation.navigate(ROUTES.WALLET_HOME),
      title: I18n.t("global.buttons.continue")
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
        </AppHeader>

        <ScrollView
          bounces={false}
          style={WalletStyles.whiteBg}
          keyboardShouldPersistTaps="handled"
        >
          <Content scrollEnabled={false}>
            <LabelledItem
              label={I18n.t("wallet.dummyCard.labels.holder")}
              icon="io-titolare"
              placeholder={I18n.t("wallet.dummyCard.values.holder")}
              inputProps={{
                onChangeText: value => {
                  this.setState({
                    holder: value !== EMPTY_CARD_HOLDER ? some(value) : none
                  });
                },
                value: this.state.holder.getOrElse(EMPTY_CARD_HOLDER),
                autoCapitalize: "words"
              }}
            />

            <View spacer={true} />

            <LabelledItem
              label={I18n.t("wallet.dummyCard.labels.pan")}
              icon="io-carta"
              placeholder={I18n.t("wallet.dummyCard.values.pan")}
              inputProps={{
                onChangeText: this.onPanChange,
                value: this.state.pan.getOrElse(EMPTY_CARD_PAN),
                keyboardType: "numeric",
                maxLength: 23
              }}
            />

            <View spacer={true} />
            <Grid>
              <Col>
                <LabelledItem
                  label={I18n.t("wallet.dummyCard.labels.expirationDate")}
                  icon="io-calendario"
                  placeholder={I18n.t("wallet.dummyCard.values.expirationDate")}
                  inputProps={{
                    onChangeText: this.onExpirationDateChange,
                    value: this.state.expirationDate.getOrElse(
                      EMPTY_CARD_EXPIRATION_DATE
                    ),
                    keyboardType: "numeric"
                  }}
                />
              </Col>
              <Col style={styles.verticalSpacing} />
              <Col>
                <LabelledItem
                  label={I18n.t("wallet.dummyCard.labels.securityCode")}
                  icon="io-lucchetto"
                  placeholder={I18n.t("wallet.dummyCard.values.securityCode")}
                  inputProps={{
                    onChangeText: value => {
                      this.setState({
                        securityCode:
                          value !== EMPTY_CARD_SECURITY_CODE
                            ? some(value)
                            : none
                      });
                    },
                    value: this.state.securityCode.getOrElse(
                      EMPTY_CARD_SECURITY_CODE
                    ),
                    keyboardType: "numeric",
                    maxLength: 4,
                    secureTextEntry: true
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
          leftButton={primaryButtonProps}
          rightButton={secondaryButtonProps}
          inlineHalf={true}
        />
      </Container>
    );
  }
}
