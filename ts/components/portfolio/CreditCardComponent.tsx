import * as React from "react";

import { Body, Card, Icon, Text } from "native-base";
import { Image } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";

import { CreditCard } from "../../types/portfolio/CreditCard";
import { CreditCardType } from "../../types/portfolio/CreditCardType";
import { CreditCardStyle } from "../styles";

type Props = Readonly<{
  item: CreditCard;
  navigation: NavigationScreenProp<NavigationState>;
}>;

// Images
const imgMastercard = require("../../../img/portfolio/issuers/mastercard.png");
const imgVisa = require("../../../img/portfolio/cards-icons/visa.png");
const imgAmex = require("../../../img/portfolio/cards-icons/amex.png");
const imgDiners = require("../../../img/portfolio/cards-icons/amex.png");
const imgMaestro = require("../../../img/portfolio/cards-icons/amex.png");
const imgElectron = require("../../../img/portfolio/cards-icons/visa-electron.png");

/**
 * Credit card component
 */
export default class CreditCardComponent extends React.Component<Props> {
  private getCreditCardImage: any = (creditCardNumber: string) => {
    const creditCardType: CreditCardType = CreditCard.getCardType(
      creditCardNumber
    );

    switch (creditCardType) {
      case CreditCardType.VISA:
        return imgVisa;
      case CreditCardType.MASTERCARD:
        return imgMastercard;
      case CreditCardType.DINERS:
        return imgDiners;
      case CreditCardType.AMEX:
        return imgAmex;
      case CreditCardType.MAESTRO:
        return imgMaestro;
      case CreditCardType.VISAELECTRON:
        return imgElectron;
      default:
        return imgMastercard;
    }
  };

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
                  {("\u25cf".repeat(4) + " ").repeat(3) + item.number.slice(-4)}
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
                  {I18n.t("creditCardComponent.validUntil") + item.expires}
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
                  source={this.getCreditCardImage(item.number)}
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
                onPress: (): boolean =>
                  navigate(ROUTES.PORTFOLIO_CARDS_OPERATIONS, { card: item })
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
