import * as React from "react";
import { Row } from "react-native-easy-grid";
import { TopContent, TopContentTouchable } from "./types";

type Props = Readonly<{
  content: TopContent;
}>;

export const TOUCHABLE_SIZE = 2;

export class Touchable extends React.Component<Props> {
  public render(): React.ReactNode {
    const { touchableContent } = this.props.content as TopContentTouchable;
    return <Row size={TOUCHABLE_SIZE}>{touchableContent}</Row>;
  }
}
