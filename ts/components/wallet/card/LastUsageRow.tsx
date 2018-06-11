import * as React from "react";
import { CreditCard } from '../../../types/CreditCard';
import { NavigationScreenProp, NavigationState } from 'react-navigation';
import { Col, Row } from 'react-native-easy-grid';
import { Text } from "native-base";
import ROUTES from '../../../navigation/routes';
import { ActionIcon } from './ActionIcon';
import { CreditCardStyles } from './style';
import variables from '../../../theme/variables';


type Props = Readonly<{
  navigation:  NavigationScreenProp<NavigationState>,
  item: CreditCard,
  showMsg?: boolean
}>;

export class LastUsageRow extends React.Component<Props> {
  static defaultProps = {
    showMsg: true
  };
  
  public render() {
    const { navigate } = this.props.navigation;
    const { item } = this.props;
    if (this.props.showMsg) {
      return (
        <Row
          style={CreditCardStyles.rowStyle}
          size={6}
          {...{
            onPress: (): boolean =>
              navigate(ROUTES.WALLET_CARD_TRANSACTIONS, { card: item })
          }}
        >
          <Col size={8}>
            <Text
              style={[
                CreditCardStyles.textStyle,
                CreditCardStyles.smallTextStyle
              ]}
            >
              {item.lastUsage}
            </Text>
          </Col>
          <Col size={1}>
            <ActionIcon
              name="io-right"
              size={variables.iconSize2}
            />
          </Col>
        </Row>
      );
    }
    return <Row size={2} />;
  }
}