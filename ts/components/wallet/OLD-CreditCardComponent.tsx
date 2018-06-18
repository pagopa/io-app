/**
 * This component is used to display a credit card
 * with its information.
 */
// TODO: this component will be substantially modified, in order to:
// - have a grid-only layout that does not rely on margins and other ungodly things
// - be used throughout the app whenever needed (as of now, CreditCardComponent can
//   only be used when displaying the list of credit cards, with the rest being
//   cropped pictures)
// @https://www.pivotaltracker.com/story/show/157422715

import * as React from "react";

import { Body, Card, Icon, Text } from "native-base";
import { Image, Platform, StyleSheet } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import I18n from "../../i18n";

import {
  CreditCard,
  CreditCardType,
  getCardType
} from "../../types/CreditCard";

import color from "color";
import { connect, Dispatch } from "react-redux";
import ROUTES from "../../navigation/routes";
import { selectCardForDetails } from "../../store/actions/wallet/cards";
import { makeFontStyleObject } from "../../theme/fonts";
import variables from "../../theme/variables";

const FOUR_UNICODE_CIRCLES = "\u25cf".repeat(4);
const HIDDEN_CREDITCARD_NUMBERS = `${FOUR_UNICODE_CIRCLES} `.repeat(3);

type ReduxMappedProps = Readonly<{
  selectCard: (item: CreditCard) => void;
}>;

type OwnProps = Readonly<{
  item: CreditCard;
  navigation: NavigationScreenProp<NavigationState>;
}>;

type Props = OwnProps & ReduxMappedProps;

export const CreditCardStyle = StyleSheet.create({
  largeTextStyle: {
    ...makeFontStyleObject(Platform.select, undefined, false, "RobotoMono"),
    fontSize: variables.fontSize4
  },
  rowStyle: {
    alignItems: "center"
  },
  textStyle: {
    marginLeft: 15,
    color: variables.cardFontColor
  },
  cardStyle: {
    backgroundColor: color(variables.colorWhite)
      .darken(0.05)
      .string(),
    borderRadius: 10,
    marginTop: 10,
    height: 200
  },
  smallTextStyle: {
    fontSize: variables.fontSize2,
    color: variables.brandDarkGray
  },
  iconStyle: {
    fontSize: variables.fontSize5,
    color: variables.brandPrimary,
    paddingLeft: 10
  },
  whiteBarStyle: {
    borderWidth: 0,
    borderBottomColor: variables.colorWhite,
    borderBottomWidth: 2,
    paddingBottom: 15,
    width: "100%"
  },
  issuerLogo: {
    width: "100%",
    resizeMode: "contain"
  }
});

export const getCardIcon = (cc: CreditCard) => {
  const type = getCardType(cc);
  const icons: { [key in CreditCardType]: any } = {
    MASTERCARD: require("../../../img/wallet/cards-icons/mastercard.png"),
    VISA: require("../../../img/wallet/cards-icons/visa.png"),
    AMEX: require("../../../img/wallet/cards-icons/amex.png"),
    DINERS: require("../../../img/wallet/cards-icons/diners.png"),
    MAESTRO: require("../../../img/wallet/cards-icons/maestro.png"),
    VISAELECTRON: require("../../../img/wallet/cards-icons/visa-electron.png"),
    POSTEPAY: require("../../../img/wallet/cards-icons/postepay.png"),
    UNIONPAY: require("../../../img/wallet/cards-icons/unknown.png"),
    DISCOVER: require("../../../img/wallet/cards-icons/unknown.png"),
    JCB: require("../../../img/wallet/cards-icons/unknown.png"),
    UNKNOWN: require("../../../img/wallet/cards-icons/unknown.png")
  };
  return icons[type];
};

/**
 * Credit card component
 */
class CreditCardComponent extends React.Component<Props> {
  public render(): React.ReactNode {
    const { item } = this.props;
    const { navigate } = this.props.navigation;
    return (
      <Card style={CreditCardStyle.cardStyle}>
        <Body>
          <Grid>
            <Row size={2} style={CreditCardStyle.rowStyle}>
              <Col size={7}>
                <Text
                  style={[
                    CreditCardStyle.textStyle,
                    CreditCardStyle.largeTextStyle
                  ]}
                >
                  {`${HIDDEN_CREDITCARD_NUMBERS}${item.pan.slice(-4)}`}
                </Text>
              </Col>
              <Col size={1}>
                <Icon
                  type="MaterialIcons"
                  active={false}
                  style={CreditCardStyle.iconStyle}
                  name="star-border"
                />
              </Col>
              <Col size={1}>
                <Icon
                  type="MaterialIcons"
                  active={true}
                  style={CreditCardStyle.iconStyle}
                  name="more-vert"
                />
              </Col>
            </Row>
            <Row size={1} style={CreditCardStyle.rowStyle}>
              <Col>
                <Text
                  style={[
                    CreditCardStyle.textStyle,
                    CreditCardStyle.smallTextStyle
                  ]}
                >
                  {`${I18n.t("creditCardComponent.validUntil")}${
                    item.expirationDate
                  }`}
                </Text>
              </Col>
            </Row>
            <Row
              size={2}
              style={[CreditCardStyle.rowStyle, CreditCardStyle.whiteBarStyle]}
            >
              <Col size={7}>
                <Text style={CreditCardStyle.textStyle}>
                  {item.owner.toUpperCase()}
                </Text>
              </Col>
              <Col size={2}>
                <Image
                  style={CreditCardStyle.issuerLogo}
                  source={getCardIcon(item)}
                />
              </Col>
              <Col size={1}>
                <Text>&nbsp;</Text>
              </Col>
            </Row>
            <Row
              style={CreditCardStyle.rowStyle}
              size={2}
              {...{
                onPress: () => {
                  this.props.selectCard(item);
                  navigate(ROUTES.WALLET_CARD_TRANSACTIONS);
                }
              }}
            >
              <Col size={8}>
                <Text
                  style={[
                    CreditCardStyle.textStyle,
                    CreditCardStyle.smallTextStyle
                  ]}
                >
                  {item.lastUsage}
                </Text>
              </Col>
              <Col size={1}>
                <Icon
                  type="MaterialIcons"
                  style={CreditCardStyle.iconStyle}
                  name="keyboard-arrow-right"
                />
              </Col>
            </Row>
          </Grid>
        </Body>
      </Card>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedProps => ({
  selectCard: card => dispatch(selectCardForDetails(card))
});
export default connect(
  undefined,
  mapDispatchToProps
)(CreditCardComponent);
