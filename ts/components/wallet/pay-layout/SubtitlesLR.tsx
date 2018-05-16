import { Left, Right, Text } from "native-base";
import * as React from "react";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { WalletStyles } from "../../styles";
import { TopContent, TopContentSubtitlesLR } from "./types";

type Props = Readonly<{
  content: TopContent;
  navigation: NavigationScreenProp<NavigationState>;
}>;

export const SUBTITLES_LR_SIZE = 2;

export class SubtitlesLR extends React.Component<Props> {
  public render(): React.ReactNode {
    const { subtitleLeftText, subtitleRightText } = this.props
      .content as TopContentSubtitlesLR;
    return (
      <Row size={SUBTITLES_LR_SIZE}>
        <Grid>
          <Col size={1}>
            <Row>
              <Left>
                <Text style={WalletStyles.pfSubtitleLeft}>
                  {subtitleLeftText}
                </Text>
              </Left>
            </Row>
          </Col>
          <Col size={1}>
            <Row>
              <Right>
                <Text
                  style={WalletStyles.pfText}
                  onPress={() => this.props.navigation.navigate("")}
                >
                  {subtitleRightText}
                </Text>
              </Right>
            </Row>
          </Col>
        </Grid>
      </Row>
    );
  }
}
