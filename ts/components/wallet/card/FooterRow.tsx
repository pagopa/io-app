/**
 * A component for the bottom row of the
 * credit card component, which either
 * contains the "last usage" string or a
 * bottom padding in those cases where
 * the "last usage" part is not required
 */
import { Text } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { Col, Row } from "react-native-easy-grid";
import variables from "../../../theme/variables";
import { Wallet } from "../../../types/pagopa";
import { buildFormattedLastUsage } from "../../../utils/stringBuilder";
import IconFont from "../../ui/IconFont";
import { CreditCardStyles } from "./style";

type OwnProps = Readonly<{
  wallet: Wallet;
  showMsg?: boolean;
  navigateToWalletTransactions?: (item: Wallet) => void;
}>;

type Props = OwnProps;

const styles = StyleSheet.create({
  rightAligned: {
    flexDirection: "row",
    justifyContent: "flex-end"
  }
});

class FooterRow extends React.Component<Props> {
  public static defaultProps: Partial<Props> = {
    showMsg: true
  };

  public render() {
    const { navigateToWalletTransactions } = this.props;
    const { wallet } = this.props;
    if (this.props.showMsg) {
      // show "last usage" row
      return (
        <Row
          style={CreditCardStyles.rowStyle}
          size={6}
          onPress={
            navigateToWalletTransactions
              ? () => navigateToWalletTransactions(wallet)
              : undefined
          }
        >
          <Col size={8}>
            <Text
              style={[
                CreditCardStyles.textStyle,
                CreditCardStyles.smallTextStyle
              ]}
            >
              {buildFormattedLastUsage(wallet)}
            </Text>
          </Col>
          <Col size={1} style={styles.rightAligned}>
            <IconFont
              name="io-right"
              size={variables.iconSize2}
              color={variables.brandPrimary}
            />
          </Col>
        </Row>
      );
    }
    return <Row size={2} />; // pad
  }
}

export default FooterRow;
