/**
 * Component rendering a credit card,
 * with different appearences based on
 * the props passed
 */
import * as pot from "italia-ts-commons/lib/pot";
import { Text, View } from "native-base";
import * as React from "react";
import { Alert } from "react-native";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger
} from "react-native-popup-menu";
import I18n from "../../../i18n";
import variables from "../../../theme/variables";
import { CreditCard, Wallet } from "../../../types/pagopa";
import { buildExpirationDate } from "../../../utils/stringBuilder";
import { isExpiredCard } from "../../../utils/wallet";
import ButtonDefaultOpacity from "../../ButtonDefaultOpacity";
import IconFont from "../../ui/IconFont";
import styles from "./CardComponent.style";
import Logo from "./Logo";
import { CreditCardStyles } from "./style";

// TODO: the "*" character renders differently (i.e. a larger circle) on
// some devices @https://www.pivotaltracker.com/story/show/159231780
const FOUR_UNICODE_CIRCLES = "\u25cf".repeat(4);
const HIDDEN_CREDITCARD_NUMBERS = `${FOUR_UNICODE_CIRCLES} `.repeat(3);

interface BaseProps {
  wallet: Wallet;
}

interface FullCommonProps extends BaseProps {
  isFavorite?: pot.Pot<boolean, string>;
  onSetFavorite?: (willBeFavorite: boolean) => void;
  hideMenu?: boolean;
  extraSpace?: boolean;
  hideFavoriteIcon?: boolean;
  onDelete?: () => void;
  showPsp?: boolean;
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
          onPress:
            this.props.type === "Full" || this.props.type === "Header"
              ? this.props.onDelete
              : undefined
        }
      ],
      { cancelable: false }
    );

  private handleFavoritePress = () => {
    if (
      (this.props.type === "Full" || this.props.type === "Header") &&
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

    if (
      this.props.type === "Preview" ||
      this.props.type === "Picking" ||
      (this.props.type === "Full" && this.props.showPsp)
    ) {
      return (
        <View style={styles.cardLogo}>
          <Logo item={wallet.creditCard} />
        </View>
      );
    }

    if (this.props.type === "Full" || this.props.type === "Header") {
      const {
        hideFavoriteIcon,
        isFavorite,
        onSetFavorite,
        onDelete,
        hideMenu
      } = this.props;

      return (
        <View style={styles.row}>
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
                onPress={this.handleFavoritePress}
              />
            )}

          {!hideMenu && (
            <Menu>
              <MenuTrigger>
                <IconFont
                  name={"io-more"}
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
        </View>
      );
    }

    return null;
  }

  private renderBody(creditCard: CreditCard) {
    const { type, wallet } = this.props;

    const getBodyIcon = () => {
      if (
        this.props.type === "Picking" ||
        (this.props.type === "Full" && this.props.showPsp)
      ) {
        return wallet.psp ? (
          <View style={[styles.cardPsp]}>
            <Logo item={creditCard} pspLogo={wallet.psp.logoPSP} />
          </View>
        ) : (
          <View style={[styles.cardPsp]}>
            <Logo />
          </View>
        );
      }
      return (
        <View style={[styles.cardLogo, { alignSelf: "flex-end" }]}>
          <Logo item={creditCard} />
        </View>
      );
    };

    if (type === "Preview") {
      return null;
    }

    const expirationDate = buildExpirationDate(creditCard);
    const isExpired = isExpiredCard(creditCard);
    return (
      <View style={[styles.columns, styles.paddedTop]}>
        <View>
          <Text
            style={[
              CreditCardStyles.textStyle,
              !isExpired
                ? CreditCardStyles.smallTextStyle
                : CreditCardStyles.expiredTextStyle
            ]}
          >
            {!isExpired
              ? `${I18n.t("cardComponent.validUntil")}  ${expirationDate}`
              : `${I18n.t("cardComponent.expiredCard")} ${expirationDate}`}
          </Text>

          <Text style={[CreditCardStyles.textStyle, styles.marginTop]}>
            {creditCard.holder.toUpperCase()}
          </Text>
        </View>
        {getBodyIcon()}
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
      <ButtonDefaultOpacity
        style={[styles.footerButton, buttonStyle]}
        block={true}
        iconRight={true}
        onPress={this.handleOnCardPress}
      >
        <Text style={footerTextStyle}>{text}</Text>
        <IconFont
          name={"io-right"}
          size={variables.iconSize2}
          style={footerTextStyle}
        />
      </ButtonDefaultOpacity>
    );
  }

  public render(): React.ReactNode {
    const { wallet } = this.props;

    const hasFlatBottom =
      this.props.type === "Preview" || this.props.type === "Header";

    return wallet.creditCard === undefined ? null : (
      <View
        style={[styles.card, hasFlatBottom ? styles.flatBottom : undefined]}
      >
        <View style={[styles.cardInner]}>
          <View style={[styles.row, styles.spaced]}>
            <View style={styles.row}>
              <Text style={[CreditCardStyles.smallTextStyle]}>
                {`${HIDDEN_CREDITCARD_NUMBERS}`}
              </Text>
              <Text style={[CreditCardStyles.largeTextStyle]}>
                {`${wallet.creditCard.pan.slice(-4)}`}
              </Text>
            </View>
            <View>{this.renderTopRightCorner()}</View>
          </View>

          {this.renderBody(wallet.creditCard)}
        </View>

        {this.renderFooterRow()}
      </View>
    );
  }
}
