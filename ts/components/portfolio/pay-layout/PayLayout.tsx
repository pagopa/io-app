import { Button, Container, Content, Icon, Text } from "native-base";
import * as React from "react";
import { Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import I18n from "../../../i18n";

import { TopContents } from "./TopContents";
import { TopContent } from "./types";

export enum ImageType {
  BANK_IMAGE
}

type Props = Readonly<{
  title: string;
  topContent: TopContent;
  children?: React.ReactElement<any>;
  rightImage?: ImageType;
  navigation: NavigationScreenProp<NavigationState>;
  showPayNoticeButton?: boolean;
}>;

/**
 * Pay layout component
 */
export class PayLayout extends React.Component<Props, never> {
  private readonly MAIN_SIZE = 14;
  private readonly BUTTON_SIZE = 3;
  private readonly BOTTOM_SIZE = 4;

  private payNoticeButton(): React.ReactNode {
    return (
      <Row size={this.BUTTON_SIZE}>
        <Content>
          <Button block>
            <Icon type="FontAwesome" name="qrcode" />
            <Text>{I18n.t("portfolio.payNotice")}</Text>
          </Button>
        </Content>
      </Row>
    );
  }

  private twoPartsPortfolioLayout(): React.ReactNode {
    return (
      <Row size={this.MAIN_SIZE}>
        <Grid>
          <Row size={TopContents.getSize(this.props.topContent)}>
            <TopContents {...this.props} />
          </Row>
          <Row size={this.getBottomSize()}>{this.props.children}</Row>
        </Grid>
      </Row>
    );
  }

  private getBottomSize() {
    /* from the default bottom size, add the 
     * size that is not being used by the top
     * part (either because subtitles or touchable
     * parts are not used). The "unused" part
     * is given by MAX_TOP_PART - ACTUAL_TOP_PART
     */
    return (
      this.BOTTOM_SIZE +
      (TopContents.getMaxSize() - TopContents.getSize(this.props.topContent))
    );
  }

  public render(): React.ReactNode {
    return (
      <Container>
        <Grid>
          {this.twoPartsPortfolioLayout()}
          {this.payNoticeButton()}
        </Grid>
      </Container>
    );
  }
}
