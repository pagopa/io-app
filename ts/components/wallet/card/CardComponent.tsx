/**
 * Component rendering a credit card,
 * with different appearences based on
 * the props passed
 */
import color from "color";
import { Body, Card, Text } from "native-base";
import * as React from "react";
import { Alert, Platform, StyleSheet, ViewStyle } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger
} from "react-native-popup-menu";

import I18n from "../../../i18n";

import { makeFontStyleObject } from "../../../theme/fonts";
import variables from "../../../theme/variables";
import { Wallet } from "../../../types/pagopa";
import IconFont from "../../ui/IconFont";
import CardBody from "./CardBody";
import Logo, { LogoPosition, shouldRenderLogo } from "./Logo";
import { CreditCardStyles } from "./style";

// TODO: the "*" character renders differently (i.e. a larger circle) on
// some devices @https://www.pivotaltracker.com/story/show/159231780
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
    height: 184
  },
  croppedCard: {
    height: 125
  },
  headerCard: {
    height: 58
  },
  flatBottom: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  },
  rotatedCard: {
    shadowRadius: 10,
    shadowOpacity: 0.15,
    transform: [{ perspective: 700 }, { rotateX: "-20deg" }, { scaleX: 0.98 }],
    marginBottom: -3
  },
  blueText: {
    color: variables.brandPrimary,
    textAlign: "center",
    ...makeFontStyleObject(Platform.select)
  },
  paddedIcon: {
    paddingLeft: 10
  }
});

type Props = Readonly<{
  isFavorite?: boolean;
  wallet: Wallet;
  menu?: boolean;
  showFavoriteIcon?: boolean;
  lastUsage?: boolean;
  whiteLine?: boolean;
  logoPosition?: LogoPosition;
  mainAction?: (wallet: Wallet) => void;
  flatBottom?: boolean;
  headerOnly?: boolean;
  rotated?: boolean;
  customStyle?: any;
  onSetFavorite?: (willBeFavorite: boolean) => void;
  onDelete?: () => void;
  navigateToWalletTransactions?: (item: Wallet) => void;
}>;

/**
 * Credit card component
 */
export default class CardComponent extends React.Component<Props> {
  public static defaultProps: Partial<Props> = {
    menu: true,
    showFavoriteIcon: true,
    lastUsage: true,
    whiteLine: false,
    logoPosition: LogoPosition.CENTER,
    mainAction: undefined,
    flatBottom: false,
    headerOnly: false,
    rotated: false,
    customStyle: undefined
  };

  private topRightCorner() {
    const {
      wallet,
      logoPosition,
      isFavorite,
      onSetFavorite,
      onDelete,
      showFavoriteIcon
    } = this.props;

    const onToggleFavorite =
      onSetFavorite && isFavorite !== undefined
        ? () => onSetFavorite(!isFavorite)
        : undefined;

    if (logoPosition === LogoPosition.TOP) {
      return (
        <Col size={2}>
          {shouldRenderLogo(LogoPosition.TOP, logoPosition) && (
            <Logo item={wallet} />
          )}
        </Col>
      );
    } else {
      return (
        <React.Fragment>
          {showFavoriteIcon &&
            isFavorite !== undefined && (
              <Col key="favorite" size={1}>
                <IconFont
                  name={isFavorite ? "io-filled-star" : "io-empty-star"}
                  color={variables.brandPrimary}
                  style={styles.paddedIcon}
                  onPress={onToggleFavorite}
                />
              </Col>
            )}

          <Col size={1}>
            {this.props.menu && (
              <Menu>
                <MenuTrigger>
                  <IconFont
                    name="io-more"
                    color={variables.brandPrimary}
                    style={styles.paddedIcon}
                  />
                </MenuTrigger>

                <MenuOptions>
                  {onSetFavorite &&
                    isFavorite !== undefined && (
                      <MenuOption onSelect={onToggleFavorite}>
                        <Text bold={true} style={styles.blueText}>
                          {I18n.t(
                            isFavorite
                              ? "cardComponent.unsetFavourite"
                              : "cardComponent.setFavourite"
                          )}
                        </Text>
                      </MenuOption>
                    )}
                  {onDelete && (
                    <MenuOption
                      onSelect={() =>
                        Alert.alert(
                          I18n.t("cardComponent.deleteTitle"),
                          I18n.t("cardComponent.deleteMsg"),
                          [
                            {
                              text: I18n.t("global.buttons.cancel"),
                              style: "cancel"
                            },
                            {
                              text: I18n.t("global.buttons.ok"),
                              style: "destructive",
                              onPress: onDelete
                            }
                          ],
                          { cancelable: false }
                        )
                      }
                    >
                      <Text bold={true} style={styles.blueText}>
                        {I18n.t("global.buttons.delete")}
                      </Text>
                    </MenuOption>
                  )}
                </MenuOptions>
              </Menu>
            )}
          </Col>
        </React.Fragment>
      );
    }
  }

  public render(): React.ReactNode {
    const { wallet } = this.props;

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
                      {`${HIDDEN_CREDITCARD_NUMBERS}${wallet.creditCard.pan.slice(
                        -4
                      )}`}
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
