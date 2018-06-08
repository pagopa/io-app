import * as React from "react";

import { ActionSheet, Body, Card, Icon, Text } from "native-base";
import { Image, StyleSheet, Platform } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";

import color from "color";

import { Right } from "native-base";
import {
  CreditCard,
  CreditCardType,
  getCardType
} from "../../types/CreditCard";
import variables from '../../theme/variables';
import { makeFontStyleObject } from '../../theme/fonts';

export enum LogoPosition {
  TOP,
  CENTER
}

const FOUR_UNICODE_CIRCLES = "\u25cf".repeat(4);
const HIDDEN_CREDITCARD_NUMBERS = `${FOUR_UNICODE_CIRCLES} `.repeat(3);

type Props = Readonly<{
  item: CreditCard;
  navigation: NavigationScreenProp<NavigationState>;
  menu?: boolean; // default false
  favorite?: boolean; // default false
  lastUsage?: boolean; // default false
  whiteLine?: boolean; // default true
  logoPosition?: LogoPosition; // deafult LogoPosition.BOTTOM
  mainActionNavigation?: string; // default undefined
  flatBottom?: boolean; // default false
  headerOnly?: boolean; // default false
  rotated?: boolean; // default false
  customStyle?: any; // default undefined
}>;

export const styles = StyleSheet.create({
  largeTextStyle: {
    ...makeFontStyleObject(Platform.select, undefined, false, "RobotoMono"),
    fontSize: variables.fontSize4
  },
  rowStyle: {
    alignItems: "center"
  },
  textStyle: {
    fontFamily: variables.fontFamily,
    color: variables.cardFontColor
  },
  cardStyle: {
    backgroundColor: color(variables.colorWhite)
      .darken(0.05)
      .string(),
    borderRadius: 10,
    // marginTop: 20,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: -1,
  },
  fullCard: {
    height: 200
  },
  croppedCard: {
    height: 148
  },
  headerCard: {
    height: 56
  },
  flatBottom: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  },
  rotatedCard: {
    transform: [{ perspective: 850 }, { rotateX: "-30deg" }, { scale: 0.87 }],
    // shadowRadius: 10,
    // shadowOpacity: 1
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
    width: "100%"
  },
  issuerLogo: {
    width: "100%",
    height: "100%",
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
export class CreditCardComponent extends React.Component<Props> {
  private showMenu() {
    const options: string[] = [ // tslint:disable-line
      I18n.t("creditCardComponent.setFavourite"),
      I18n.t("global.buttons.delete"),
      I18n.t("global.buttons.cancel")
    ];
    const CANCEL_INDEX = options.indexOf(I18n.t("global.buttons.cancel"));
    const DELETE_INDEX = options.indexOf(I18n.t("global.buttons.delete"));

    ActionSheet.show(
      {
        options,
        cancelButtonIndex: CANCEL_INDEX,
        destructiveButtonIndex: DELETE_INDEX,
        title: I18n.t("creditCardComponent.actions")
      },
      buttonIndex => {
        switch (buttonIndex) {
          case DELETE_INDEX:
            // delete card
            break;
        }
      }
    );
  }

  private favoriteIcon() {
    if (this.props.favorite === true) {
      return (
        <Icon
          type="MaterialIcons"
          active={false}
          style={styles.iconStyle}
          name="star-border"
        />
      );
    }
    return null;
  }

  private menuIcon() {
    if (this.props.menu === true) {
      return (
        <Icon
          type="MaterialIcons"
          active={true}
          style={styles.iconStyle}
          name="more-vert"
          onPress={() => this.showMenu()}
        />
      );
    }
    return null;
  }

  private whiteLine() {
    if (this.props.lastUsage === true || this.props.whiteLine === true) {
      return (
        <Row key="whiteLine" size={2} style={styles.whiteBarStyle} />
      );
    }
    return null;
  }

  private cardLogo(position: LogoPosition) {
    const requestedPosition =
      this.props.logoPosition === undefined
        ? LogoPosition.CENTER
        : this.props.logoPosition;
    if (position === requestedPosition) {
      return (
        <Image
          style={styles.issuerLogo}
          source={
            getCardIcon(this.props.item)
          }
        />
      );
    }
    return null;
  }

  private lastUsageRow() {
    const { navigate } = this.props.navigation;
    const { item } = this.props;
    if (this.props.lastUsage === true) {
      return (
        <Row
          key="lastUsage"
          style={styles.rowStyle}
          size={6}
          {...{
            onPress: (): boolean =>
              navigate(ROUTES.WALLET_CARD_TRANSACTIONS, { card: item })
          }}
        >
          <Col size={8}>
            <Text
              style={[
                styles.textStyle,
                styles.smallTextStyle
              ]}
            >
              {item.lastUsage}
            </Text>
          </Col>
          <Col size={1}>
            <Icon
              type="MaterialIcons"
              style={styles.iconStyle}
              name="keyboard-arrow-right"
            />
          </Col>
        </Row>
      );
    }
    return <Row key="paddingBottom" size={2} />;
  }

  private topRightCorner() {
    if (this.props.logoPosition === LogoPosition.TOP) {
      return <Col size={2}>{this.cardLogo(LogoPosition.TOP)}</Col>;
    } else {
      return [
        <Col key="favorite" size={1}>
          {this.favoriteIcon()}
        </Col>,
        <Col key="menu" size={1}>
          {this.menuIcon()}
        </Col>
      ];
    }
  }

  private middleRightSide() {
    const { logoPosition, mainActionNavigation } = this.props;
    if (
      logoPosition === LogoPosition.TOP &&
      mainActionNavigation !== undefined
    ) {
      // the > can be displayed
      return (
        <Row style={styles.rowStyle}>
          <Right>
            <Icon
              type="MaterialIcons"
              style={styles.iconStyle}
              name="keyboard-arrow-right"
              onPress={() =>
                this.props.navigation.navigate(mainActionNavigation)
              }
            />
          </Right>
        </Row>
      );
    } else {
      return this.cardLogo(LogoPosition.CENTER);
    }
  }

  private cardBody() {
    const { item } = this.props;

    if (this.props.headerOnly !== true) {
      return [
        <Row key="validity" size={4} style={styles.rowStyle}>
          <Text
            style={[styles.textStyle, styles.smallTextStyle]}
          >
            {`${I18n.t("creditCardComponent.validUntil")} ${item.expirationDate}`}
          </Text>
        </Row>,
        <Row key="owner" size={6} style={styles.rowStyle}>
          <Col size={7}>
            <Text style={styles.textStyle}>
              {item.owner.toUpperCase()}
            </Text>
          </Col>
          <Col size={2}>{this.middleRightSide()}</Col>
        </Row>,
        null,
        this.whiteLine(),
        this.lastUsageRow()
      ];
    }
    return null;
  }

  public render(): React.ReactNode {
    const { item } = this.props;

    const cardStyles = [
      styles.cardStyle,
      this.props.headerOnly === true
        ? styles.headerCard
        : this.props.lastUsage === true
          ? styles.fullCard
          : styles.croppedCard
    ]
      .concat(this.props.flatBottom === true ? styles.flatBottom : [])
      .concat(this.props.rotated === true ? styles.rotatedCard : [])
      .concat(
        this.props.customStyle !== undefined ? this.props.customStyle : []
      );
    return (
      <Card style={cardStyles}>
        <Body>
          <Grid>
            <Col size={1} />
            <Col size={19}>
              <Grid>
                <Row size={1} />
                <Row size={6} style={styles.rowStyle}>
                  <Col size={7}>
                    <Text
                      style={[
                        styles.textStyle,
                        styles.largeTextStyle
                      ]}
                    >
                    {`${HIDDEN_CREDITCARD_NUMBERS}${item.pan.slice(-4)}`}
                    </Text>
                  </Col>

                  {this.topRightCorner()}
                </Row>
                {this.cardBody()}
              </Grid>
            </Col>

            <Col size={1} />
          </Grid>
        </Body>
      </Card>
    );
  }
}
