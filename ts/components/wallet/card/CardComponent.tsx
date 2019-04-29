/**
 * Component rendering a credit card,
 * with different appearences based on
 * the props passed
 */
import * as pot from "italia-ts-commons/lib/pot";
import { Button, Text, View } from "native-base";
import * as React from "react";
import { Alert, Platform, StyleSheet } from "react-native";
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
import { buildExpirationDate } from "../../../utils/stringBuilder";
import IconFont from "../../ui/IconFont";
import Logo from "./Logo";

// TODO: the "*" character renders differently (i.e. a larger circle) on
// some devices @https://www.pivotaltracker.com/story/show/159231780
const FOUR_UNICODE_CIRCLES = "\u25cf".repeat(4);
const HIDDEN_CREDITCARD_NUMBERS = `${FOUR_UNICODE_CIRCLES} `.repeat(3);

interface BaseProps {
  wallet: Wallet;
}

interface FullCommonProps extends BaseProps {
  isFavorite?: pot.Pot<boolean, Error>;
  onSetFavorite?: (willBeFavorite: boolean) => void;
  hideMenu?: boolean;
  hideFavoriteIcon?: boolean;
  onDelete?: () => void;
}

interface FullProps extends FullCommonProps {
  type: "Full";
  mainAction?: (item: Wallet) => void;
}

interface HeaderProps extends FullCommonProps {
  type: "Header";
}

interface PreviewProps extends BaseProps {
  type: "Preview";
}

interface PickingProps extends BaseProps {
  type: "Picking";
  mainAction: (wallet: Wallet) => void;
}

type Props = FullProps | HeaderProps | PreviewProps | PickingProps;

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 3,
    backgroundColor: variables.brandGray,
    borderRadius: 8,
    marginBottom: -1,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 20
  },

  cardInner: {
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 22
  },

  cardNumber: {
    flexDirection: "row",
    justifyContent: "flex-start"
  },

  columns: {
    flexDirection: "row",
    justifyContent: "space-between"
  },

  topRightCornerContainer: {
    flexDirection: "row",
    justifyContent: "flex-end"
  },

  cardLogo: {
    alignSelf: "flex-end",
    height: 30,
    width: 48
  },

  footerButton: {
    borderRadius: 6,
    paddingRight: variables.fontSizeBase,
    justifyContent: "space-between",
    margin: 2
  },

  transactions: {
    backgroundColor: variables.colorWhite
  },

  transactionsText: {
    color: variables.brandPrimary
  },
  pickPayment: {
    backgroundColor: variables.brandPrimary
  },
  pickPaymentText: {
    color: variables.colorWhite
  },

  marginTop: {
    marginTop: variables.fontSizeBase
  },

  flatBottom: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  },

  blueText: {
    color: variables.brandPrimary,
    textAlign: "center",
    ...makeFontStyleObject(Platform.select)
  },

  paddedIcon: {
    paddingLeft: 10
  },

  largeTextStyle: {
    ...makeFontStyleObject(Platform.select, undefined, false, "RobotoMono"),
    fontSize: variables.fontSizeBase * 1.125 // 18
  },

  textStyle: {
    fontFamily: variables.fontFamily,
    color: variables.cardFontColor
  },

  smallTextStyle: {
    fontSize: variables.fontSizeSmall,
    color: variables.brandDarkGray
  }
});

/**
 * Credit card component
 */
export default class CardComponent extends React.Component<Props> {
  private handleDeleteSelect = () =>
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
          onPress: this.props.type === "Full" ? this.props.onDelete : undefined
        }
      ],
      { cancelable: false }
    );

  private handleFavoritePress = () => {
    if (
      this.props.type === "Full" &&
      this.props.onSetFavorite !== undefined &&
      this.props.isFavorite !== undefined &&
      !pot.isLoading(this.props.isFavorite) &&
      !pot.isUpdating(this.props.isFavorite)
    ) {
      this.props.onSetFavorite(!pot.getOrElse(this.props.isFavorite, false));
    }
  };

  private handleOnCardPress = () => {
    if (
      (this.props.type === "Full" || this.props.type === "Picking") &&
      this.props.mainAction
    ) {
      this.props.mainAction(this.props.wallet);
    }
  };

  private renderTopRightCorner() {
    const { wallet } = this.props;

    if (this.props.type === "Full" || this.props.type === "Header") {
      const {
        hideFavoriteIcon,
        isFavorite,
        onSetFavorite,
        onDelete,
        hideMenu
      } = this.props;

      return (
        <React.Fragment>
          {!hideFavoriteIcon &&
            isFavorite !== undefined && (
              <IconFont
                name={
                  pot.getOrElseWithUpdating(isFavorite, false) === true
                    ? "io-filled-star"
                    : "io-empty-star"
                }
                color={
                  pot.isUpdating(isFavorite)
                    ? variables.brandDarkGray
                    : variables.brandPrimary
                }
                style={styles.paddedIcon}
                onPress={this.handleFavoritePress}
              />
            )}

          {!hideMenu && (
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
                    <MenuOption onSelect={this.handleFavoritePress}>
                      <Text bold={true} style={styles.blueText}>
                        {I18n.t(
                          pot.getOrElseWithUpdating(isFavorite, false) === true
                            ? "cardComponent.unsetFavourite"
                            : "cardComponent.setFavourite"
                        )}
                      </Text>
                    </MenuOption>
                  )}

                {onDelete && (
                  <MenuOption onSelect={this.handleDeleteSelect}>
                    <Text bold={true} style={styles.blueText}>
                      {I18n.t("global.buttons.delete")}
                    </Text>
                  </MenuOption>
                )}
              </MenuOptions>
            </Menu>
          )}
        </React.Fragment>
      );
    }

    if (this.props.type === "Preview") {
      return (
        <View style={styles.cardLogo}>
          <Logo item={wallet} />
        </View>
      );
    }

    return null;
  }

  private renderBody() {
    const { type, wallet } = this.props;

    if (type === "Preview") {
      return null;
    }

    const expirationDate = buildExpirationDate(wallet);

    return (
      <View style={[styles.columns, styles.marginTop]}>
        <View>
          <Text style={[styles.textStyle, styles.smallTextStyle]}>
            {`${I18n.t("cardComponent.validUntil")} ${expirationDate}`}
          </Text>

          <Text style={[styles.textStyle, styles.marginTop]}>
            {wallet.creditCard.holder.toUpperCase()}
          </Text>
        </View>

        <View style={styles.cardLogo}>
          <Logo item={wallet} />
        </View>
      </View>
    );
  }

  private renderFooterRow() {
    if (
      this.props.type === "Preview" ||
      this.props.type === "Header" ||
      this.props.mainAction === undefined
    ) {
      return null;
    }

    const isFullCard = this.props.type === "Full";

    const buttonStyle = isFullCard ? styles.transactions : styles.pickPayment;
    const footerTextStyle = isFullCard
      ? styles.transactionsText
      : styles.pickPaymentText;
    const text = I18n.t(
      isFullCard ? "cardComponent.detailsAndTransactions" : "cardComponent.pick"
    );

    return (
      <Button
        style={[styles.footerButton, buttonStyle]}
        block={true}
        iconRight={true}
      >
        <Text style={footerTextStyle}>{text}</Text>
        <IconFont
          name="io-right"
          size={variables.iconSize2}
          style={footerTextStyle}
        />
      </Button>
    );
  }

  public render(): React.ReactNode {
    const { wallet } = this.props;

    const hasFlatBottom =
      this.props.type === "Preview" || this.props.type === "Header";

    return (
      <View
        style={[styles.card, hasFlatBottom ? styles.flatBottom : undefined]}
        onTouchStart={this.handleOnCardPress}
      >
        <View style={styles.cardInner}>
          <View style={styles.columns}>
            <View style={[styles.cardNumber]}>
              <Text style={[styles.smallTextStyle]}>
                {`${HIDDEN_CREDITCARD_NUMBERS}`}
              </Text>
              <Text style={[styles.largeTextStyle]}>
                {`${wallet.creditCard.pan.slice(-4)}`}
              </Text>
            </View>

            <View style={styles.topRightCornerContainer}>
              {this.renderTopRightCorner()}
            </View>
          </View>

          {this.renderBody()}
        </View>

        {this.renderFooterRow()}
      </View>
    );
  }
}
