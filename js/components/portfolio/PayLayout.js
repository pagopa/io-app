/**
 * CITTADINANZA DIGITALE
 * Basic portfolio layout with
 * bottom 'Pay' button
 *
 * @flow
 */

import * as React from 'react'
import I18n from '../../i18n'
import {
  Container,
  Content,
  H1,
  Text,
  Left,
  Right,
  Button,
  Icon
} from 'native-base'
import { Grid, Row } from 'react-native-easy-grid'
import { PortfolioStyles } from '../../components/styles'
import {type NavigationScreenProp, type NavigationState} from 'react-navigation'
import { type ReduxProps } from '../../actions/types'
import ROUTES from '../../navigation/routes'
import { withNavigation } from 'react-navigation'

type Props = {
  title: string,
  subtitleLeft: string,
  subtitleRight?: string,
  touchableContent?: React.Node,
  children?: React.Node,
  navigation: NavigationScreenProp<NavigationState>
}

/**
 * Pay layout component
 */
class PayLayout extends React.Component<Props> {
  
  rowSize(rowIndex: number) : $ReadOnlyArray<number> {
    const buttonRowSize = 3
    let titleRowSize = 6
    let contentRowSize = 8
    if (this.props.touchableContent) {
      // eslint-disable-next-line no-magic-numbers
      titleRowSize = 10
      // eslint-disable-next-line no-magic-numbers
      contentRowSize = 6
    }
    const rowSizes = [titleRowSize, contentRowSize, buttonRowSize]
    return rowSizes[rowIndex]
  }
  
  render(): React.Node {
    return (
      <Container>
        <Grid>
          <Row size={this.rowSize(0)}>
            <Content style={PortfolioStyles.pfback}>
              <Grid>
                <Row style={{ marginTop: 95 }} />
                <Row>
                  <H1 style={PortfolioStyles.pftitle}>{this.props.title}</H1>
                </Row>
                <Row>
                  <Left>
                    <Text style={PortfolioStyles.pfsubtitle}>
                      {this.props.subtitleLeft}
                    </Text>
                  </Left>
                  <Right>
                    <Text style={PortfolioStyles.pftext} onPress={() => this.props.navigation.navigate(ROUTES.PORTFOLIO_ADD_PAYMENT_METHOD)}>
                      {this.props.subtitleRight}
                    </Text>
                  </Right>
                </Row>
                <Row>{this.props.touchableContent}</Row>
              </Grid>
            </Content>
          </Row>
          <Row size={this.rowSize(1)}>{this.props.children}</Row>
          <Row size={this.rowSize(2)}>
            <Content>
              <Button block 
                onPress={(): boolean =>
                  this.props.navigation.navigate(
                    ROUTES.PORTFOLIO_SAVE_CARD
                  )
                }
              >
                <Icon type="FontAwesome" name="qrcode" />
                <Text>{I18n.t('portfolio.payNotice')}</Text>
              </Button>
            </Content>
          </Row>
        </Grid>
      </Container>
    )
  }
}

export default withNavigation(PayLayout)
