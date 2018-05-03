import { Button, Container, Content, H1, Icon, Left, Right, Text } from 'native-base'
import * as React from 'react'
import { Grid, Row } from 'react-native-easy-grid'
import { NavigationScreenProp, NavigationState } from 'react-navigation'
import I18n from '../../i18n'
import ROUTES from '../../navigation/routes'
import { PortfolioStyles } from '../styles'

type Props = {
  title: string,
  subtitleLeft: string,
  subtitleRight?: string,
  touchableContent?: React.ReactElement<any>,
  children?: React.ReactElement<any>,
  navigation: NavigationScreenProp<NavigationState>
}

/**
 * Pay layout component
 */
export class PayLayout extends React.Component<Props, never> {

  public render(): React.ReactNode {
    return (
      <Container>
        <Grid>
          <Row size={this.rowSize(0)}>
            <Content style={PortfolioStyles.pfback}>
              <Grid>
                <Row size={1} style={{marginTop: 70}}><Text>&nbsp;</Text></Row>
                <Row size={2}>
                  <H1 style={PortfolioStyles.pftitle}>{this.props.title}</H1>
                </Row>
                <Row size={4}>
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
                <Row size={3}>{this.props.touchableContent}</Row>
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

  private rowSize(rowIndex: number) : number {
    const buttonRowSize = 3
    let titleRowSize = 6
    let contentRowSize = 8
    if (this.props.touchableContent) {
      titleRowSize = 10
      contentRowSize = 6
    }
    const rowSizes = [titleRowSize, contentRowSize, buttonRowSize]
    return rowSizes[rowIndex]
  }


}


