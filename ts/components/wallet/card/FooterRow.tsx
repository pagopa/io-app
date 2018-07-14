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
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";
import { Wallet } from "../../../../definitions/pagopa/Wallet";
import ROUTES from "../../../navigation/routes";
import { Dispatch } from "../../../store/actions/types";
import { selectWalletForDetails } from "../../../store/actions/wallet/wallets";
import variables from "../../../theme/variables";
import { getCardLastUsage, getWalletId } from "../../../types/CreditCard";
import IconFont from "../../ui/IconFont";
import { CreditCardStyles } from "./style";

type ReduxMappedProps = Readonly<{
  selectWallet: (item: number) => void;
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
  item: Wallet;
  showMsg?: boolean;
}>;

type Props = OwnProps & ReduxMappedProps;

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
    const { navigate } = this.props.navigation;
    const { item } = this.props;
    if (this.props.showMsg) {
      // show "last usage" row
      return (
        <Row
          style={CreditCardStyles.rowStyle}
          size={6}
          onPress={() => {
            this.props.selectWallet(getWalletId(item));
            navigate(ROUTES.WALLET_CARD_TRANSACTIONS);
          }}
        >
          <Col size={8}>
            <Text
              style={[
                CreditCardStyles.textStyle,
                CreditCardStyles.smallTextStyle
              ]}
            >
              {getCardLastUsage(item)}
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

const mapDispatchToProps = (dispatch: Dispatch): ReduxMappedProps => ({
  selectWallet: item => dispatch(selectWalletForDetails(item))
});

export default connect(
  undefined,
  mapDispatchToProps
)(FooterRow);
