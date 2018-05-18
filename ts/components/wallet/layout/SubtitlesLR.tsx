/**
 * Component representing two subtitles within a TopContents:
 * these two subtitles are left- and right-aligned within the
 * top part of the layout
 */

import { Left, Right, Text } from "native-base";
import * as React from "react";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { WalletStyles } from "../../styles";
import { TopContent, hasSubtitlesLR } from "./types";

type Props = Readonly<{
  content: TopContent;
  navigation: NavigationScreenProp<NavigationState>;
}>;

/* size of the component ("height") */
export const SUBTITLES_LR_SIZE = 2;

export class SubtitlesLR extends React.Component<Props> {
  public render(): React.ReactNode {
    if (hasSubtitlesLR(this.props.content)) {
      /* the left part of the component should be touchable,
      * right now the destination is hardcoded since there
      * is no use for additional destinations. In the future, 
      * this may no longer be the case and a touchable content
      * may need to be provided via props
      */
      return (
        <Row size={SUBTITLES_LR_SIZE}>
          <Grid>
            <Col size={1}>
              <Row>
                <Left>
                  <Text style={WalletStyles.payLayoutSubtitleLeft}>
                    {this.props.content.subtitleLeftText}
                  </Text>
                </Left>
              </Row>
            </Col>
            <Col size={1}>
              <Row>
                <Right>
                  <Text
                    style={WalletStyles.standardText}
                    onPress={() => this.props.navigation.navigate("")}
                  >
                    {this.props.content.subtitleRightText}
                  </Text>
                </Right>
              </Row>
            </Col>
          </Grid>
        </Row>
      );
    }
    return null;
  }
}
