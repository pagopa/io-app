/**
 * Component representing a subtitle within TopContents.
 */

import { Text } from "native-base";
import * as React from "react";
import { Grid, Row } from "react-native-easy-grid";
import { WalletStyles } from "../../styles/wallet";
import { hasMainSubtitle, TopContent } from "./types";

type Props = Readonly<{
  content: TopContent;
}>;

// size of the subtitle row
export const SUBTITLE_SIZE = 2;

export class Subtitle extends React.Component<Props> {
  public render(): React.ReactNode {
    if (hasMainSubtitle(this.props.content)) {
      return (
        <Row size={SUBTITLE_SIZE}>
          <Grid>
            <Row>
              <Text style={WalletStyles.standardText}>
                {this.props.content.subtitleText}
              </Text>
            </Row>
          </Grid>
        </Row>
      );
    }
    return null;
  }
}
