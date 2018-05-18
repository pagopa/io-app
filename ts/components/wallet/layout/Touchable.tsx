/**
 * Returns the touchable component wrapped by a Row
 */
import * as React from "react";
import { Row } from "react-native-easy-grid";
import { TopContent, hasTouchable } from "./types";

type Props = Readonly<{
  content: TopContent;
}>;

export const TOUCHABLE_SIZE = 2;

export class Touchable extends React.Component<Props> {
  public render(): React.ReactNode {
    if (hasTouchable(this.props.content)) {
      return <Row size={TOUCHABLE_SIZE}>{this.props.content.touchableContent}</Row>;
    }
    return null;
  }
}
