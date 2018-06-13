/**
 * Component rendering a credit card,
 * with different appearences based on
 * the props passed
 */
import { ActionSheet, Body, Card, Text } from "native-base";
import * as React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";

import I18n from "../../../i18n";

import color from "color";
import variables from "../../../theme/variables";
import { CreditCard } from "../../../types/CreditCard";
import { ActionIcon } from "./ActionIcon";
import { CardBody } from "./CardBody";
import Logo, { LogoPosition, shouldRenderLogo } from "./Logo";
import { CreditCardStyles } from "./style";

const FOUR_UNICODE_CIRCLES = "\u25cf".repeat(4);
const HIDDEN_CREDITCARD_NUMBERS = `${FOUR_UNICODE_CIRCLES} `.repeat(3);

const styles = StyleSheet.create({
  cardStyle: {
    backgroundColor: color(variables.colorWhite)
      .darken(0.05)
      .string(),
    borderRadius: 10,
    marginTop: 20,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: -1
  },
  fullCard: {
    height: 200
  },
  croppedCard: {
    height: 148
  },
  headerCard: {
    height: 58
  },
  flatBottom: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  },
  rotatedCard: {
    transform: [{ perspective: 850 }, { rotateX: "-20deg" }],
    marginBottom: -3
    // shadowRadius: 10,
    // shadowOpacity: 1
  }
});

export type Props = Readonly<{
  item: CreditCard;
  navigation: NavigationScreenProp<NavigationState>;
  menu?: boolean;
  favorite?: boolean;
  lastUsage?: boolean;
  whiteLine?: boolean;
  logoPosition?: LogoPosition;
  mainActionNavigation?: string;
  flatBottom?: boolean;
  headerOnly?: boolean;
  rotated?: boolean;
  customStyle?: any;
}>;

/**
 * Credit card component
 */
export class CreditCardComponent extends React.Component<Props> {
  public static defaultProps = {
    menu: true,
    favorite: true,
    lastUsage: true,
    whiteLine: false,
    logoPosition: LogoPosition.CENTER,
    mainActionNavigation: undefined,
    flatBottom: false,
    headerOnly: false,
    rotated: false,
    customStyle: undefined
  };

  public showMenu = () => {
    // tslint:disable-next-line: readonly-array
    const options: string[] = [
      I18n.t("creditCardComponent.setFavourite"),
      I18n.t("global.buttons.delete"),
      I18n.t("global.buttons.cancel")
    ];
    const CANCEL_INDEX = options.indexOf(I18n.t("global.buttons.cancel"));
    const FAVORITE_INDEX = options.indexOf(
      I18n.t("creditCardComponent.setFavourite")
    );
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
          case DELETE_INDEX: {
            // delete card
            break;
          }
          case FAVORITE_INDEX: {
            // set card as favorite
            break;
          }
        }
      }
    );
  };

  private topRightCorner() {
    if (this.props.logoPosition === LogoPosition.TOP) {
      return (
        <Col size={2}>
          {shouldRenderLogo(LogoPosition.TOP, this.props.logoPosition) && (
            <Logo item={this.props.item} />
          )}
        </Col>
      );
    } else {
      return [
        <Col key="favorite" size={1}>
          {this.props.favorite && <ActionIcon name="io-empty-star" />}
        </Col>,
        <Col key="menu" size={1}>
          {this.props.menu && (
            <ActionIcon name="io-more" onPress={this.showMenu} />
          )}
        </Col>
      ];
    }
  }

  public render(): React.ReactNode {
    const { item } = this.props;

    const cardStyles: ReadonlyArray<ViewStyle> = [
      styles.cardStyle,
      this.props.headerOnly
        ? styles.headerCard
        : this.props.lastUsage
          ? styles.fullCard
          : styles.croppedCard,
      this.props.flatBottom ? styles.flatBottom : {},
      this.props.rotated ? styles.rotatedCard : {},
      this.props.customStyle !== undefined ? this.props.customStyle : {}
    ];
    return (
      // tslint:disable-next-line: readonly-array
      <Card style={cardStyles as ViewStyle[]}>
        <Body>
          <Grid>
            <Col size={1} />
            <Col size={19}>
              <Grid>
                <Row size={1} />
                <Row size={6} style={CreditCardStyles.rowStyle}>
                  <Col size={7}>
                    <Text
                      style={[
                        CreditCardStyles.textStyle,
                        CreditCardStyles.largeTextStyle
                      ]}
                    >
                      {`${HIDDEN_CREDITCARD_NUMBERS}${item.pan.slice(-4)}`}
                    </Text>
                  </Col>

                  {this.topRightCorner()}
                </Row>
                {!this.props.headerOnly && <CardBody {...this.props} />}
              </Grid>
            </Col>

            <Col size={1} />
          </Grid>
        </Body>
      </Card>
    );
  }
}
