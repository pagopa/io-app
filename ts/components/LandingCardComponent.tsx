/**
 * This component renders the card displayed in the landing page carousel
 */

import * as React from "react";
import { View, Dimensions, Image, ScrollView, StyleSheet } from "react-native";
import { Col, Grid } from "react-native-easy-grid";
import { VSpacer } from "./core/spacer/Spacer";
import { Body } from "./core/typography/Body";
import { H2 } from "./core/typography/H2";
import { IOStyles } from "./core/variables/IOStyles";

type Props = {
  id: number;
  image: NodeRequire;
  title: string;
  content: string;
};

const screenWidth = Dimensions.get("screen").width;

const styles = StyleSheet.create({
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
  <ScrollView>
    <View style={styles.card}>
      <Image source={card.image} style={styles.image} />
      <VSpacer size={16} />
      <Grid>
        <Col size={1} />
        <Col size={7}>
          <View style={IOStyles.alignCenter}>
            <H2 weight="Bold">{card.title}</H2>
          </View>
          <VSpacer size={16} />
          <View style={IOStyles.alignCenter}>
            <Body>{card.content}</Body>
          </View>
          <VSpacer size={16} />
        </Col>
        <Col size={1} />
      </Grid>
    </View>
  </ScrollView>
);
