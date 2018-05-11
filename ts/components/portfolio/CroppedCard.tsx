import * as React from "react";
import { CreditCard } from '../../types/portfolio/CreditCard'
import { NavigationScreenProp, NavigationState } from 'react-navigation'
import { StyleSheet } from 'react-native'
import CreditCardComponent from './CreditCardComponent'
import { Row } from 'react-native-easy-grid'
import { Body } from 'native-base'

type Props = Readonly<{
  card: CreditCard;
  navigation: NavigationScreenProp<NavigationState>;
}>;

const CroppedCardStyle = StyleSheet.create({
  container: {
    marginTop: -30,
  },
  transx: {
    transform: [
      { rotateX: '60deg'},
    ],
  }
});

export class CroppedCard extends React.Component<Props, never>
{
  public render(): React.ReactNode
  {
    return(
      <Body>
        <Row style={CroppedCardStyle.container}>
          <CreditCardComponent
                    navigation={this.props.navigation}
                    item={this.props.card}
                  />
        </Row>
      </Body>
    );
  }
}
