/**
 * Wallet layout, split into two parts:
 * - the top-most one shows a header w/ a title, subtitle,
 *   image and touchable content (or a subset of these)
 * - the bottom-most part shows the current screen's contents
 *   (e.g. list of payment methods)
 */

import { Button, Container, Icon, Text, View } from "native-base";
import * as React from "react";
import { Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import I18n from "../../../i18n";

import { TopContents, TOP_CONTENTS_MAX_SIZE } from "./TopContents";
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
}>;

const WALLET_LAYOUT_BOTTOM_SIZE = 4;
export class WalletLayout extends React.Component<Props, never> {
  private payNoticeButton(): React.ReactNode {
    return (
      <View footer={true}>
        <Button block={true}>
          <Icon type="FontAwesome" name="qrcode" />
          <Text>{I18n.t("wallet.payNotice")}</Text>
        </Button>
      </View>
    );
  }

  /* The top part is defined by the TopContent component, 
   * the bottom part is defined by this.props.children
   */
  private twoPartsLayout(): React.ReactNode {
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
      WALLET_LAYOUT_BOTTOM_SIZE +
      (TOP_CONTENTS_MAX_SIZE - TopContents.getSize(this.props.topContent))
    );
  }

  public render(): React.ReactNode {
    return (
      <Container>
        {this.twoPartsLayout()}
        {this.payNoticeButton()}
      </Container>
    );
  }
}
