import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { InfoBox } from "../../components/box/InfoBox";
import { Body } from "../../components/core/typography/Body";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { ShowroomSection } from "./ShowroomSection";

const styles = StyleSheet.create({
  content: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly"
  }
});

export const OthersShowroom = () => (
  <ShowroomSection title={"Others"}>
    <View style={[styles.content, IOStyles.horizontalContentPadding]}>
      <InfoBox>
        <Body>
          Lorem ipsum dolor sit amet, consectetur adipisci elit, sed do eiusmod
          tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim
          veniam, quis nostrum exercitationem ullamco laboriosam, nisi ut
          aliquid ex ea commodi consequatur.
        </Body>
      </InfoBox>
    </View>
  </ShowroomSection>
);
