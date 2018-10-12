/**
 * Component rendering a credit card,
 * with different appearences based on
 * the props passed
 */
import color from "color";
import { none, Option, some } from "fp-ts/lib/Option";
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
import { connect } from "react-redux";

import I18n from "../../../i18n";
import { Dispatch } from "../../../store/actions/types";
import {
  deleteWalletRequest,
  setFavoriteWallet
} from "../../../store/actions/wallet/wallets";
import { GlobalState } from "../../../store/reducers/types";
import { getFavoriteWalletId } from "../../../store/reducers/wallet/wallets";
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

type ReduxMappedStateProps = Readonly<{
  isFavoriteCard: boolean;
}>;

type ReduxMappedDispatchProps = Readonly<{
  setFavoriteCard: (item: Option<number>) => void;
  deleteWallet: (walletId: number) => void;
}>;

type OwnProps = Readonly<{
  item: Wallet;
  menu?: boolean;
  favorite?: boolean;
  lastUsage?: boolean;
  whiteLine?: boolean;
  logoPosition?: LogoPosition;
  mainAction?: (wallet: Wallet) => void;
  flatBottom?: boolean;
  headerOnly?: boolean;
  rotated?: boolean;
  customStyle?: any;
  navigateToDetails: () => void;
}>;

type Props = OwnProps & ReduxMappedStateProps & ReduxMappedDispatchProps;

/**
 * Credit card component
 */
class CardComponent extends React.Component<Props> {
  public static defaultProps: Partial<Props> = {
    menu: true,
    favorite: true,
    lastUsage: true,
    whiteLine: false,
    logoPosition: LogoPosition.CENTER,
    mainAction: undefined,
    flatBottom: false,
    headerOnly: false,
    rotated: false,
    customStyle: undefined
  };

  private toggleFavorite = () => {
    if (this.props.isFavoriteCard) {
      this.props.setFavoriteCard(none);
    } else {
      this.props.setFavoriteCard(some(this.props.item.idWallet));
    }
  };

  private topRightCorner() {
    const { item } = this.props;
    if (this.props.logoPosition === LogoPosition.TOP) {
      return (
        <Col size={2}>
          {shouldRenderLogo(LogoPosition.TOP, this.props.logoPosition) && (
            <Logo item={item} />
          )}
        </Col>
      );
    } else {
      return [
        <Col key="favorite" size={1}>
          {this.props.favorite && (
            <IconFont
              name={
                this.props.isFavoriteCard ? "io-filled-star" : "io-empty-star"
              }
              color={variables.brandPrimary}
              style={styles.paddedIcon}
              onPress={this.toggleFavorite}
            />
          )}
        </Col>,
        <Col key="menu" size={1}>
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
                <MenuOption onSelect={this.toggleFavorite}>
                  <Text bold={true} style={styles.blueText}>
                    {I18n.t(
                      this.props.isFavoriteCard
                        ? "cardComponent.unsetFavourite"
                        : "cardComponent.setFavourite"
                    )}
                  </Text>
                </MenuOption>
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
                          onPress: () => this.props.deleteWallet(item.idWallet)
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
              </MenuOptions>
            </Menu>
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
                      {`${HIDDEN_CREDITCARD_NUMBERS}${item.creditCard.pan.slice(
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

const mapStateToProps = (
  state: GlobalState,
  props: OwnProps
): ReduxMappedStateProps => {
  const favoriteCard = getFavoriteWalletId(state);
  return {
    isFavoriteCard: favoriteCard.fold(
      false,
      walletId => walletId === props.item.idWallet
    )
  };
};

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedDispatchProps => ({
  setFavoriteCard: (item: Option<number>) => dispatch(setFavoriteWallet(item)),
  deleteWallet: (walletId: number) => dispatch(deleteWalletRequest(walletId))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CardComponent);
