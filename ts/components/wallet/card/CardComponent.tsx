/**
 * Component rendering a credit card,
 * with different appearences based on
 * the props passed
 */
import {
  Body,
  H6,
  IOColors,
  Icon,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { Image, Platform, StyleSheet, View } from "react-native";
import { BlurredPan } from "../../../features/wallet/component/card/BlurredPan";
import I18n from "../../../i18n";
import { CreditCard, CreditCardType, Wallet } from "../../../types/pagopa";
import { CreditCardDetector, SupportedBrand } from "../../../utils/creditCard";
import { isPaymentMethodExpired } from "../../../utils/paymentMethod";
import { buildExpirationDate } from "../../../utils/stringBuilder";
import { FOUR_UNICODE_CIRCLES } from "../../../utils/wallet";
import TouchableDefaultOpacity from "../../TouchableDefaultOpacity";
import Logo, { cardIcons } from "./Logo";

interface BaseProps {
  wallet: Wallet;
}

interface FullCommonProps extends BaseProps {
  isFavorite?: pot.Pot<boolean, Error>;
  onSetFavorite?: (willBeFavorite: boolean) => void;
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

const styles = StyleSheet.create({
  cardHeader: {
    marginTop: -20,
    marginLeft: 12,
    marginRight: 12,
    paddingBottom: 10,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8
  },
  cardShadow: {
    shadowColor: IOColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: Platform.OS === "android" ? 5 : 25,
    zIndex: Platform.OS === "android" ? 5 : 25
  },
  card: {
    // iOS and Android card shadow
    backgroundColor: IOColors.greyUltraLight,
    borderRadius: 8,
    marginLeft: 0,
    marginRight: 0
  },
  cardInner: {
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 18
  },
  row: {
    flexDirection: "row"
  },
  spaced: {
    justifyContent: "space-between"
  },
  columns: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  cardLogo: {
    height: 30,
    width: 48
  },
  flatBottom: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  },
  paddedTop: {
    paddingTop: 10
  }
});

/**
 * Credit card component
 * @deprecated Use {@link BaseCardComponent} and related custom implementation (eg: {@link CreditCardComponent})
 */
export default class CardComponent extends React.Component<Props> {
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
      const { hideFavoriteIcon, isFavorite } = this.props;

      return (
        <View style={styles.row}>
          {!hideFavoriteIcon && isFavorite !== undefined && (
            <TouchableDefaultOpacity onPress={this.handleFavoritePress}>
              <Icon
                name={
                  pot.getOrElseWithUpdating(isFavorite, false)
                    ? "starFilled"
                    : "starEmpty"
                }
                color={pot.isUpdating(isFavorite) ? "bluegrey" : "blue"}
              />
            </TouchableDefaultOpacity>
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
                accessibilityIgnoresInvertColors
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
          <H6 color={isCardExpired ? "red" : "bluegreyDark"}>
            {`${I18n.t("cardComponent.validUntil")} ${expirationDate}`}
          </H6>
          <VSpacer size={16} />
          <Body color="bluegreyDark">{creditCard.holder.toUpperCase()}</Body>
        </View>
        {getBodyIcon()}
      </View>
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
          {hasFlatBottom && <VSpacer size={16} />}
          {isHeader && <View style={{ paddingTop: 20 }} />}
          {this.renderBody(wallet.creditCard)}
        </View>
      </View>
    );
  }
}
