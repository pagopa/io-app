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
import ROUTES from "../../../navigation/routes";
import { Dispatch } from "../../../store/actions/types";
import { selectCardForDetails } from "../../../store/actions/wallet/cards";
import variables from "../../../theme/variables";
import { CreditCard, CreditCardId } from "../../../types/CreditCard";
import IconFont from "../../ui/IconFont";
import { CreditCardStyles } from "./style";

type ReduxMappedProps = Readonly<{
  selectCard: (item: CreditCardId) => void;
}>;

type OwnProps = Readonly<{
  navigation: NavigationScreenProp<NavigationState>;
  item: CreditCard;
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
            this.props.selectCard(item.id);
            navigate(ROUTES.WALLET_CARD_TRANSACTIONS);
          }}
        >
          <Col size={9}>
            <Text
              style={[
                CreditCardStyles.textStyle,
                CreditCardStyles.smallTextStyle
              ]}
            >
              {item.lastUsage}
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
  selectCard: item => dispatch(selectCardForDetails(item))
});

export default connect(
  undefined,
  mapDispatchToProps
)(FooterRow);
