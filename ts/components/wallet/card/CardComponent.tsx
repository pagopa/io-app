/**
 * Component rendering a credit card,
 * with different appearences based on
 * the props passed
 */
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Text, View } from "native-base";
import * as React from "react";
import { Alert, Image } from "react-native";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger
} from "react-native-popup-menu";
import { BlurredPan } from "../../../features/wallet/component/card/BlurredPan";
import I18n from "../../../i18n";
import variables from "../../../theme/variables";
import { CreditCard, CreditCardType, Wallet } from "../../../types/pagopa";
import { CreditCardDetector, SupportedBrand } from "../../../utils/creditCard";
import { isPaymentMethodExpired } from "../../../utils/paymentMethod";
import { buildExpirationDate } from "../../../utils/stringBuilder";
import { FOUR_UNICODE_CIRCLES } from "../../../utils/wallet";
import ButtonDefaultOpacity from "../../ButtonDefaultOpacity";
import { H5 } from "../../core/typography/H5";
import { IOColors } from "../../core/variables/IOColors";
import IconFont from "../../ui/IconFont";
import styles from "./CardComponent.style";
import Logo, { cardIcons } from "./Logo";
import { CreditCardStyles } from "./style";

interface BaseProps {
  wallet: Wallet;
}

interface FullCommonProps extends BaseProps {
  isFavorite?: pot.Pot<boolean, Error>;
  onSetFavorite?: (willBeFavorite: boolean) => void;
  hideMenu?: boolean;
  extraSpace?: boolean;
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
 * @deprecated Use {@link BaseCardComponent} and related custom implementation (eg: {@link CreditCardComponent})
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
    if (this.props.type === "Preview" || this.props.type === "Picking") {
      const { wallet } = this.props;
      return (
        <View style={styles.cardLogo}>
          <Logo item={wallet.creditCard} />
        </View>
      );
    }

    if (this.props.type === "Header") {
      const {
        hideFavoriteIcon,
        isFavorite,
        onSetFavorite,
        onDelete,
        hideMenu
      } = this.props;

      return (
        <View style={styles.row}>
          {!hideFavoriteIcon && isFavorite !== undefined && (
            <IconFont
              name={
                pot.getOrElseWithUpdating(isFavorite, false)
                  ? "io-filled-star"
                  : "io-empty-star"
              }
              color={
                pot.isUpdating(isFavorite)
                  ? IOColors.bluegrey
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
                {onSetFavorite && isFavorite !== undefined && (
                  <MenuOption onSelect={this.handleFavoritePress}>
                    <Text bold={true} style={styles.blueText}>
                      {I18n.t(
                        pot.getOrElseWithUpdating(isFavorite, false)
                          ? "cardComponent.unsetFavorite"
                          : "cardComponent.setFavorite"
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
    const { type } = this.props;

    if (type === "Preview") {
      return null;
    }

    // Extract the brand name from the credit card pan
    const detectedBrand: SupportedBrand = CreditCardDetector.validate(
      O.some(creditCard.pan)
    );
    /**
     * Extract the brand logo from the brand name
     * since the keys of the @link{cardIcons} are the @link{CreditCardType}
     * we must manage the case with the different name but the same logo
     */
    const creditCardType = CreditCardType.decode(
      detectedBrand.name.toUpperCase()
    );
    const logo =
      cardIcons[
        pipe(
          creditCardType,
          E.getOrElseW(() => "UNKNOWN" as const)
        )
      ];

    const BASE_ICON_W = 48;
    const BASE_ICON_H = 30;

    const getBodyIcon = () => {
      switch (type) {
        case "Picking":
          return null;
        case "Full":
        case "Header":
          return (
            <View style={{ alignSelf: "flex-end" }}>
              <Image
                source={logo}
                style={{
                  width: BASE_ICON_W,
                  height: BASE_ICON_H,
                  resizeMode: "contain"
                }}
              />
            </View>
          );
      }
    };
    const expirationDate = buildExpirationDate(creditCard);
    const isCardExpired = this.props.wallet.paymentMethod
      ? pipe(
          isPaymentMethodExpired(this.props.wallet.paymentMethod),
          E.getOrElse(() => false)
        )
      : false;
    return (
      <View style={[styles.columns, styles.paddedTop]}>
        <View>
          <H5 color={isCardExpired ? "red" : "bluegreyDark"} weight={"Regular"}>
            {`${I18n.t("cardComponent.validUntil")} ${expirationDate}`}
          </H5>
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

    const isHeader = this.props.type === "Header";

    return wallet.creditCard === undefined ? null : (
      <View
        style={[
          styles.card,
          styles.cardShadow,
          hasFlatBottom ? styles.flatBottom : undefined,
          isHeader && styles.cardHeader
        ]}
      >
        <View style={styles.cardInner}>
          <View style={[styles.row, styles.spaced]}>
            <View style={styles.row}>
              <BlurredPan>
                {`${FOUR_UNICODE_CIRCLES} ${wallet.creditCard.pan.slice(-4)}`}
              </BlurredPan>
            </View>
            <View>{this.renderTopRightCorner()}</View>
          </View>
          {hasFlatBottom && <View spacer={true} />}
          {isHeader && <View style={{ paddingTop: 20 }} />}
          {this.renderBody(wallet.creditCard)}
        </View>
        {this.renderFooterRow()}
      </View>
    );
  }
}
