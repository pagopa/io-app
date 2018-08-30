/**
 * This component renders the card displayed in the landing page carousel
 */

import { Text, View } from "native-base";
import * as React from "react";
import { Dimensions, Image, StyleSheet } from "react-native";
import { Col } from "react-native-easy-grid";
import { Grid } from "react-native-easy-grid";

type Props = {
  id: number;
  image: NodeRequire;
  title: string;
  content: string;
};

const screenWidth = Dimensions.get("screen").width;

const style = StyleSheet.create({
  card: {
    width: screenWidth,
    alignItems: "center",
    alignContent: "flex-start"
  },
  image: {
    width: screenWidth / 2,
    height: screenWidth / 2,
    resizeMode: "contain"
  }
});

export const LandingCardComponent: React.SFC<Props> = card => (
  <View style={style.card}>
    <Image source={card.image} style={style.image} />
    <View spacer={true} />
    <Grid>
      <Col size={1} />
      <Col size={7}>
        <Text bold={true} alignCenter={true}>
          {" "}
          {card.title}{" "}
        </Text>
        <View spacer={true} />
        <Text alignCenter={true}> {card.content} </Text>
        <View spacer={true} />
      </Col>
      <Col size={1} />
    </Grid>
  </View>
);
