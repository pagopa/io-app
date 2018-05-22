/**
 * Component representing the title in a TopContents.
 * The title is comprised by a text and an optional
 * image displayed on the right-hand side of the screen
 */
import { H1 } from "native-base";
import * as React from "react";
import { Image } from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";
import { WalletStyles } from "../../styles/wallet";
import { ImageType } from "./WalletLayout";

type Props = Readonly<{
  text: string;
  rightImage?: ImageType;
}>;

// size of the title component (in "rows")
export const TITLE_SIZE = 3;

export class Title extends React.Component<Props> {
  private optionalRightImage(): React.ReactNode {
    const images = {
      [ImageType.BANK_IMAGE]: require("../../../../img/wallet/wallet-icon.png")
    };
    // optionally display an image, if specified
    if (this.props.rightImage !== undefined) {
      return (
        <Col size={1}>
          <Image
            source={images[this.props.rightImage]}
            style={WalletStyles.pfImage}
          />
        </Col>
      );
    }
    return null;
  }

  public render(): React.ReactNode {
    return (
      <Row size={TITLE_SIZE}>
        <Grid>
          <Col size={2}>
            <Row size={1} />
            <Row size={1}>
              <H1 style={WalletStyles.payLayoutTitle}>{this.props.text}</H1>
            </Row>
          </Col>
          {this.optionalRightImage()}
        </Grid>
      </Row>
    );
  }
}
