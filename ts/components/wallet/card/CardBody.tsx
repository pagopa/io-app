/**
 * Component rendering the "body" of the credit
 * card, defined as the part of the credit card
 * below the header (which displays the card number)
 */
import { Right, Text } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { Col, Row } from "react-native-easy-grid";

import I18n from "../../../i18n";

import variables from "../../../theme/variables";

import { Wallet } from "../../../types/pagopa";

import { buildExpirationDate } from "../../../utils/stringBuilder";

import IconFont from "../../ui/IconFont";

import FooterRow from "./FooterRow";

import Logo, { LogoPosition, shouldRenderLogo } from "./Logo";

import { CreditCardStyles } from "./style";

const styles = StyleSheet.create({
  whiteBarStyle: {
    borderWidth: 0,
    borderBottomColor: variables.colorWhite,
    borderBottomWidth: 2,
    width: "100%"
  }
});

type Props = Readonly<{
  wallet: Wallet;
  logoPosition?: LogoPosition;
  mainAction?: (wallet: Wallet) => void;
  lastUsage?: boolean;
  whiteLine?: boolean;
  navigateToWalletTransactions: (item: Wallet) => void;
}>;

export default class CardBody extends React.Component<Props> {
  /**
   * Display the right-end part of the
   * card body. This will be the card
   * logo if this is the location where the
   * instantiated component asked to display
   * it; otherwise, the forward (">") icon
   * is shown
   */
  private rightPart() {
    const { logoPosition, mainAction } = this.props;
    if (logoPosition === LogoPosition.TOP) {
      // the ">" icon can be displayed since
      // the logo is being positioned on the
      // top of the card (if cases where the
      // icon needs to be on the top and the
      // ">" icon is not to be shown must be
      // handled here)
      return (
        <Row
          style={CreditCardStyles.rowStyle}
          onPress={() =>
            mainAction !== undefined ? mainAction(this.props.wallet) : undefined
          }
        >
          <Right>
            <IconFont
              name="io-right"
              size={variables.iconSize2}
              color={variables.brandPrimary}
            />
          </Right>
        </Row>
      );
    } else {
      return shouldRenderLogo(LogoPosition.CENTER, this.props.logoPosition) ? (
        <Logo item={this.props.wallet} />
      ) : null;
    }
  }

  /**
   * (optionally) display a white line that separated the
   * card body from the footer
   */
  private whiteLine() {
    if (this.props.lastUsage === true || this.props.whiteLine === true) {
      return <Row key="whiteLine" size={2} style={styles.whiteBarStyle} />;
    }
    return null;
  }

  public render() {
    const { wallet } = this.props;
    const expirationDate = buildExpirationDate(wallet);
    // returns a list of rows, namely:
    // - the "validity" row displaying when the card expires
    // - the "owner" row, displaying the owner name on the left-end
    //   side, and either a card logo or a "forward" button on the
    //   right-end one
    // - "whiteLine" is an (optional) white line that separates the
    //   top part of the card body to its bottom one
    // - "footerRow" is the bottom-most row of the card body and either
    //   contains a "pressable" row (which directs to a card's
    //   transactions) or some paddings
    return [
      <Row key="validity" size={4} style={CreditCardStyles.rowStyle}>
        <Text
          style={[CreditCardStyles.textStyle, CreditCardStyles.smallTextStyle]}
        >
          {`${I18n.t("cardComponent.validUntil")} ${expirationDate}`}
        </Text>
      </Row>,
      <Row key="owner" size={6} style={CreditCardStyles.rowStyle}>
        <Col size={7}>
          <Text style={CreditCardStyles.textStyle}>
            {wallet.creditCard.holder.toUpperCase()}
          </Text>
        </Col>
        <Col size={2}>{this.rightPart()}</Col>
      </Row>,
      this.whiteLine(),
      <FooterRow
        wallet={wallet}
        showMsg={this.props.lastUsage}
        key={"footerRow"}
        navigateToWalletTransactions={this.props.navigateToWalletTransactions}
      />
    ];
  }
}
