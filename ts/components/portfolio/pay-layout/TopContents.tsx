import * as React from "react";
import { Col, Grid } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { PortfolioStyles } from "../../styles";
import { ImageType } from "./PayLayout";
import { Subtitle, SUBTITLE_SIZE } from "./Subtitle";
import { SUBTITLES_LR_SIZE, SubtitlesLR } from "./SubtitlesLR";
import { Title, TITLE_SIZE } from "./Title";
import { Touchable, TOUCHABLE_SIZE } from "./Touchable";
import { TopContent } from "./types";

type Props = Readonly<{
  title: string;
  topContent: TopContent;
  children?: React.ReactElement<any>;
  rightImage?: ImageType;
  navigation: NavigationScreenProp<NavigationState>;
}>;

export class TopContents extends React.Component<Props> {
  public static getSize(topContent: TopContent) {
    const { hasTouchable, hasMainSubtitle, hasSubtitlesLR } = topContent;
    const titleSize = TITLE_SIZE;
    const subtitleSize = hasMainSubtitle
      ? SUBTITLE_SIZE
      : hasSubtitlesLR
        ? SUBTITLES_LR_SIZE
        : 0;
    const touchableSize = hasTouchable ? TOUCHABLE_SIZE : 0;

    return titleSize + subtitleSize + touchableSize;
  }

  public static getMaxSize() {
    return (
      TITLE_SIZE + Math.max(SUBTITLE_SIZE, SUBTITLES_LR_SIZE) + TOUCHABLE_SIZE
    );
  }

  private getSubtitles() {
    const { topContent } = this.props;
    if (topContent.hasMainSubtitle === true) {
      return <Subtitle content={this.props.topContent} />;
    }
    if (topContent.hasSubtitlesLR === true) {
      return (
        <SubtitlesLR content={topContent} navigation={this.props.navigation} />
      );
    }
    return null;
  }

  private getTouchable() {
    const { topContent } = this.props;
    if (topContent.hasTouchable === true) {
      return <Touchable content={topContent} />;
    }
    return null;
  }

  public render(): React.ReactNode {
    return (
      <Grid style={PortfolioStyles.topContainer}>
        <Col size={1} />
        <Col size={14}>
          <Title text={this.props.title} rightImage={this.props.rightImage} />
          {this.getSubtitles()}
          {this.getTouchable()}
        </Col>
        <Col size={1} />
      </Grid>
    );
  }
}
