import { Button, Container, Icon, Text, View } from "native-base";
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
const BOTTOM_SIZE = 4;
export class PayLayout extends React.Component<Props, never> {
  private payNoticeButton(): React.ReactNode {
    return (
      <View footer={true}>
        <Button block={true}>
          <Icon type="FontAwesome" name="qrcode" />
          <Text>{I18n.t("portfolio.payNotice")}</Text>
        </Button>
      </View>
    );
  }

  private twoPartsPortfolioLayout(): React.ReactNode {
    return (
      <Grid>
        <Row size={TopContents.getSize(this.props.topContent)}>
          <TopContents {...this.props} />
        </Row>
        <Row size={this.getBottomSize()}>{this.props.children}</Row>
      </Grid>
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
      BOTTOM_SIZE +
      (TopContents.getMaxSize() - TopContents.getSize(this.props.topContent))
    );
  }

  public render(): React.ReactNode {
    return (
      <Container>
        {this.twoPartsPortfolioLayout()}
        {this.payNoticeButton()}
      </Container>
    );
  }
}
