import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import LadyBug from "../../../img/test/faceID.svg";
import { InfoBox } from "../../components/box/InfoBox";
import { Body } from "../../components/core/typography/Body";
import { Label } from "../../components/core/typography/Label";
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
      <Label>{"<InfoBox />"}</Label>
      <InfoBox>
        <Body>
          Lorem ipsum dolor sit amet, consectetur adipisci elit, sed do eiusmod
          tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim
          veniam, quis nostrum exercitationem ullamco laboriosam, nisi ut
          aliquid ex ea commodi consequatur.
        </Body>
      </InfoBox>
    </View>
    <Label>{"Svg"}</Label>
    <View spacer={true} />
    <View spacer={true} />
    <LadyBug width={150} height={150} />
    <View spacer={true} extralarge={true} />
  </ShowroomSection>
);
