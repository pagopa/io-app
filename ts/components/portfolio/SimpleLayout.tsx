import * as React from "react"
import {
  Container,
  Content,
  H1
} from "native-base"
import { Grid, Row } from "react-native-easy-grid"
import { PortfolioStyles } from "../styles"

type Props = {
  title: string,
  touchableContent?: React.ReactNode,
  children?: React.ReactNode
}

/**
 * Simple layout component
 */
export class SimpleLayout extends React.Component<Props, never> {

  render(): React.ReactNode {
    return (
      <Container>
        <Grid>
          <Row size={5}>
            <Content style={PortfolioStyles.pfback}>
              <Grid>
                <Row style={{ marginTop: 95 }} />
                <Row>
                  <H1 style={PortfolioStyles.pfsubtitle}>{this.props.title}</H1>
                </Row>
                <Row>{this.props.touchableContent}</Row>
              </Grid>
            </Content>
          </Row>
          <Row size={6}>{this.props.children}</Row>
        </Grid>
      </Container>
    )
  }
}
