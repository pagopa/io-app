/**
 * top-most part of the wallet layout, comprised of
 * a title, subtitle (either single, or split into a
 * left and right one), an optional image (on the right-
 * hand side of the title) and a touchable content
 * (below the subtitles)
 */
import * as React from "react";
import { Col, Grid, Row } from "react-native-easy-grid";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { WalletStyles } from "../../styles/wallet";
import { Subtitle, SUBTITLE_SIZE } from "./Subtitle";
import { SUBTITLES_LR_SIZE, SubtitlesLR } from "./SubtitlesLR";
import { Title, TITLE_SIZE } from "./Title";
import { TopContent, hasTouchable } from "./types";
import { ImageType } from "./WalletLayout";

type Props = Readonly<{
  title: string;
  topContent: TopContent;
  children?: React.ReactElement<any>;
  rightImage?: ImageType;
  navigation: NavigationScreenProp<NavigationState>;
}>;

// size (in rows) of the touchable content
const TOUCHABLE_SIZE = 2;

// maximum size attainable (if title, subtitles and touchable are all present)
// (used to define how much space can be left to the bottom part if anything is
// missing)
export const TOP_CONTENTS_MAX_SIZE =
  TITLE_SIZE + Math.max(SUBTITLE_SIZE, SUBTITLES_LR_SIZE) + TOUCHABLE_SIZE;

export class TopContents extends React.Component<Props> {
  /* this method returns the (vertical) size of a
   * given TopContent, based on which sub-components are 
   * actually being required (e.g. subtitles, touchable contents)
   */
  // TODO: a future PR will introduce a dynamic "empty space"
  // allocation whereby the empty space left by either missing
  // subtitles or missing touchable contents can be redistributed
  // to the rest of the components in the TopContents, rather than
  // leaving to the bottom part of the screen
  public static getSize(topContent: TopContent) {
    const { hasTouchable, hasMainSubtitle, hasSubtitlesLR } = topContent;
    const titleSize = TITLE_SIZE;
    /* if topContent has the main subtitle, subtitleSize
     *  is set to the main subtitle's size (height),
     * if topContent has the left-right subtitles, the
     *  subtitle size is set to that component's size,
     * otherwise (no subtitles used) its size is 0
     */
    const subtitleSize =
      hasMainSubtitle === true
        ? SUBTITLE_SIZE
        : hasSubtitlesLR === true
          ? SUBTITLES_LR_SIZE
          : 0;
    /* if topContent uses a touchable, it sets its size to that of
    the touchable object, otherwise it is set to 0 */
    const touchableSize = hasTouchable === true ? TOUCHABLE_SIZE : 0;

    /* the total size of the TopContent is the sum of the sizes
     * of its components (which are set to 0 if not present)
     */
    return titleSize + subtitleSize + touchableSize;
  }

  /* returns the appropriate subtitle based on topContent 
   * either "main", or "left-right", or none
   */
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
    return (hasTouchable(topContent)) ? <Row size={TOUCHABLE_SIZE}>{topContent.touchableContent}</Row> : null;
  }

  /* renders a title (mandatory as of now, but may be
   * rendered optional in a future version), 
   * an optional subtitle and an optional touchable content
   */
  public render(): React.ReactNode {
    return (
      <Grid style={WalletStyles.topContainer}>
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
