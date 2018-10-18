/**
 * Component rendering a credit card,
 * with different appearences based on
 * the props passed
 */
import { Button, Text, View } from "native-base";
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
import { Wallet } from "../../../types/pagopa";
import { buildExpirationDate } from "../../../utils/stringBuilder";
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
  isFavorite?: boolean;
  hideMenu?: boolean;
  onSetFavorite?: (willBeFavorite: boolean) => void;
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
    if (this.props.type === "Full" && this.props.onSetFavorite !== undefined) {
      this.props.onSetFavorite(!this.props.isFavorite);
    }
  };

  private handleOnFooterPress = () => {
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
                name={isFavorite ? "io-filled-star" : "io-empty-star"}
                color={variables.brandPrimary}
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
                          isFavorite
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
          <Text
            style={[
              CreditCardStyles.textStyle,
              CreditCardStyles.smallTextStyle
            ]}
          >
            {`${I18n.t("cardComponent.validUntil")} ${expirationDate}`}
          </Text>

          <Text style={[CreditCardStyles.textStyle, styles.marginTop]}>
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
        onPress={this.handleOnFooterPress}
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
      >
        <View style={styles.cardInner}>
          <View style={styles.columns}>
            <Text
              style={[
                CreditCardStyles.textStyle,
                CreditCardStyles.largeTextStyle
              ]}
            >
              {`${HIDDEN_CREDITCARD_NUMBERS}${wallet.creditCard.pan.slice(-4)}`}
            </Text>

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
