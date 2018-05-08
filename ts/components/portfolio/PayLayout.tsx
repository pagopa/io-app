import {
  Button,
  Container,
  Content,
  H1,
  Icon,
  Left,
  Right,
  Text
} from "native-base";
import * as React from "react";
import { Image } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { PortfolioStyles } from "../styles";

export enum ImageType {
  BANK_IMAGE
}

type Props = {
  title: string;
  subtitleLeft?: string;
  subtitleRight?: string;
  subtitle?: string;
  touchableContent?: React.ReactElement<any>;
  children?: React.ReactElement<any>;
  rightImage?: ImageType;
  navigation: NavigationScreenProp<NavigationState>;
  showPayNoticeButton?: boolean;
};

// PayLayoutComponents
enum PLC {
  PAY_NOTICE_BUTTON, // pay notice button, anchored to the bottom of page
  MAIN_SCREEN, // main screen, divided in two parts
  TOP_PART, // top part of the main screen (title, some actions)
  BOTTOM_PART, // bottom part of the main screen (contents e.g. transactions list)
  TITLE_ROW, // title in the top part
  SUBTITLE_ROW, // subtitle in top part
  TOUCHABLE_ROW // touchable content in top part
}

/**
 * Pay layout component
 */
export class PayLayout extends React.Component<Props, never> {
  private payNoticeButton(): React.ReactNode {
    if (this.rowSize(PLC.PAY_NOTICE_BUTTON) > 0) {
      return (
        <Row size={this.rowSize(PLC.PAY_NOTICE_BUTTON)}>
          <Content>
            <Button block>
              <Icon type="FontAwesome" name="qrcode" />
              <Text>{I18n.t("portfolio.payNotice")}</Text>
            </Button>
          </Content>
        </Row>
      );
    }
    return null;
  }

  private twoPartsPortfolioLayout(): React.ReactNode {
    return (
      <Grid>
        <Row size={this.rowSize(PLC.TOP_PART)}>{this.topPortfolioLayout()}</Row>
        <Row size={this.rowSize(PLC.BOTTOM_PART)}>{this.props.children}</Row>
      </Grid>
    );
  }

  private topPortfolioLayout(): React.ReactNode {
    return (
      <Grid style={PortfolioStyles.topContainer}>
        <Col size={1} />
        <Col size={14}>
          {this.topPortfolioTitle()}
          {this.topPortfolioSubtitle()}
          {this.getTouchableContent()}
        </Col>
        <Col size={1} />
      </Grid>
    );
  }

  private topPortfolioTitle(): React.ReactNode {
    return (
      <Row size={this.rowSize(PLC.TITLE_ROW)}>
        <Grid>
          <Col size={2}>
            <Row size={1} />
            <Row size={1}>
              <H1 style={PortfolioStyles.pftitle}>{this.props.title}</H1>
            </Row>
          </Col>
          {this.optionalRightImage()}
        </Grid>
      </Row>
    );
  }

  private optionalRightImage(): React.ReactNode {
    const images = {
      [ImageType.BANK_IMAGE]: require("../../../img/portfolio/portfolio-icon.png")
    };

    if (this.props.rightImage !== undefined) {
      return (
        <Col size={1}>
          <Image
            source={images[this.props.rightImage]}
            style={PortfolioStyles.pfImage}
          />
        </Col>
      );
    }
    return null;
  }

  private topPortfolioSubtitle(): React.ReactNode {
    if (this.rowSize(PLC.SUBTITLE_ROW) > 0) {
      if (this.props.subtitle) {
        // show single subtitle
        return (
          <Row size={this.rowSize(PLC.SUBTITLE_ROW)}>
            <Grid>
              <Row>
                <Text style={PortfolioStyles.pfText}>
                  {this.props.subtitle}
                </Text>
              </Row>
            </Grid>
          </Row>
        );
      } else if (this.props.subtitleLeft || this.props.subtitleRight) {
        return (
          <Row size={this.rowSize(PLC.SUBTITLE_ROW)}>
            <Grid>
              <Col size={1}>
                <Row>
                  <Left>
                    <Text style={PortfolioStyles.pfSubtitleLeft}>
                      {this.props.subtitleLeft}
                    </Text>
                  </Left>
                </Row>
              </Col>
              <Col size={1}>
                <Row>
                  <Right>
                    <Text
                      style={PortfolioStyles.pfText}
                      onPress={() =>
                        this.props.navigation.navigate(
                          ROUTES.PORTFOLIO_ADD_PAYMENT_METHOD
                        )
                      }
                    >
                      {this.props.subtitleRight}
                    </Text>
                  </Right>
                </Row>
              </Col>
            </Grid>
          </Row>
        );
      }
    }
    return null;
  }

  private getTouchableContent(): React.ReactNode {
    if (this.rowSize(PLC.TOUCHABLE_ROW) !== undefined) {
      return (
        <Row size={this.rowSize(PLC.TOUCHABLE_ROW)}>
          {this.props.touchableContent}
        </Row>
      );
    }
    return null;
  }

  private rowSize(rowIdentifier: PLC): number {
    const sizes = {
      [PLC.PAY_NOTICE_BUTTON]: 3,
      [PLC.MAIN_SCREEN]: 14,
      [PLC.BOTTOM_PART]: 4,
      [PLC.TITLE_ROW]: 3,
      [PLC.SUBTITLE_ROW]: 2,
      [PLC.TOUCHABLE_ROW]: 2
    };

    const hasSubtitles = () =>
      this.props.subtitle !== undefined ||
      this.props.subtitleLeft !== undefined ||
      this.props.subtitleLeft !== undefined;

    const hasTouchable = () => this.props.touchableContent !== undefined;

    const maxTopSize =
      sizes[PLC.TITLE_ROW] + sizes[PLC.SUBTITLE_ROW] + sizes[PLC.TOUCHABLE_ROW];
    const topSize =
      sizes[PLC.TITLE_ROW] +
      (hasSubtitles() ? sizes[PLC.SUBTITLE_ROW] : 0) +
      (hasTouchable() ? sizes[PLC.TOUCHABLE_ROW] : 0);

    switch (rowIdentifier) {
      case PLC.PAY_NOTICE_BUTTON: {
        if (this.props.showPayNoticeButton === false) {
          return 0;
        }
        break;
      }
      case PLC.TOP_PART: {
        return topSize;
      }
      case PLC.BOTTOM_PART: {
        return sizes[PLC.BOTTOM_PART] + (maxTopSize - topSize);
      }
      case PLC.SUBTITLE_ROW: {
        if (!hasSubtitles()) {
          /* no subtitle, return 0 */
          return 0;
        }
        break;
      }
      case PLC.TOUCHABLE_ROW: {
        if (!hasTouchable()) {
          return 0;
        }
        break;
      }
    }
    return sizes[rowIdentifier];
  }

  public render(): React.ReactNode {
    return (
      <Container>
        <Grid>
          <Row size={this.rowSize(PLC.MAIN_SCREEN)}>
            {this.twoPartsPortfolioLayout()}
          </Row>
          {this.payNoticeButton()}
        </Grid>
      </Container>
    );
  }
}
