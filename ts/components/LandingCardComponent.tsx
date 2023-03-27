/**
 * This component renders the card displayed in the landing page carousel
 */

import { Text as NBText } from "native-base";
import * as React from "react";
import { View, Dimensions, Image, ScrollView, StyleSheet } from "react-native";
import { Col, Grid } from "react-native-easy-grid";
import { VSpacer } from "./core/spacer/Spacer";

type Props = {
  id: number;
  image: NodeRequire;
  title: string;
  content: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
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
  },
  text: {
    fontSize: 20
  }
});

export const LandingCardComponent: React.SFC<Props> = card => (
  <ScrollView>
    <View
      style={styles.card}
      accessible={true}
      accessibilityLabel={card.accessibilityLabel}
      accessibilityHint={card.accessibilityHint}
    >
      <Image source={card.image} style={styles.image} />
      <VSpacer size={16} />
      <Grid>
        <Col size={1} />
        <Col size={7}>
          <NBText bold={true} alignCenter={true} style={styles.text}>
            {card.title}{" "}
          </NBText>
          <VSpacer size={16} />
          <NBText alignCenter={true}> {card.content} </NBText>
          <VSpacer size={16} />
        </Col>
        <Col size={1} />
      </Grid>
    </View>
  </ScrollView>
);
