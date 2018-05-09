import { Text } from "native-base";
import * as React from "react";
import { Grid, Row } from "react-native-easy-grid";
import { PortfolioStyles } from "../../styles";
import { TopContent, TopContentSubtitle } from "./types";

type Props = Readonly<{
  content: TopContent;
}>;

export const SUBTITLE_SIZE = 2;

export class Subtitle extends React.Component<Props> {
  public render(): React.ReactNode {
    const { subtitleText } = this.props.content as TopContentSubtitle;
    return (
      <Row size={SUBTITLE_SIZE}>
        <Grid>
          <Row>
            <Text style={PortfolioStyles.pfText}>{subtitleText}</Text>
          </Row>
        </Grid>
      </Row>
    );
  }
}
