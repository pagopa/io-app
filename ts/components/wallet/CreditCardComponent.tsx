/**
 * This component is used to display a credit card
 * with its information.
 */
// TODO: as part of #157422715 (CreditCardComponent story), this component will be substantially
// modified, in order to:
// - have a grid-only layout that does not rely on margins and other ungodly things
// - be used throughout the app whenever needed (as of now, CreditCardComponent can
//   only be used when displaying the list of credit cards, with the rest being
//   cropped pictures)
// TODO: at some point, this component may need to be restructured
// to display different payment methods

import * as React from "react";

import { Body, Card, Icon, Text } from "native-base";
import { Image, StyleSheet } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import I18n from "../../i18n";

import { CreditCard, getCardIcon } from "../../types/CreditCard";

import variables from "../../theme/variables";

type Props = Readonly<{
  item: CreditCard;
  navigation: NavigationScreenProp<NavigationState>;
}>;

export const CreditCardStyle = StyleSheet.create({
  largeTextStyle: {
    fontSize: variables.fontSize4,
    fontFamily: "Roboto Mono"
  },
  rowStyle: {
    alignItems: "center"
  },
  textStyle: {
    marginLeft: 15,
    color: variables.fontColor,
    fontFamily: variables.fontFamily
  },
  cardStyle: {
    backgroundColor: "rgb(242,242,242)",
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
    borderBottomColor: "white",
    borderBottomWidth: 2,
    paddingBottom: 15,
    width: "100%"
  },
  issuerLogo: {
    width: "100%",
    resizeMode: "contain"
  }
});

/**
 * Credit card component
 */
export default class CreditCardComponent extends React.Component<Props> {
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
                  {`${`${"\u25cf".repeat(4)} `.repeat(3)}${item.pan.slice(-4)}`}
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
                onPress: (): boolean => navigate("")
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
