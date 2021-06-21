import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import AlphaChannel from "../../../img/test/alphaChannel.svg";
import Fingerprint from "../../../img/test/fingerprint.svg";
import Analytics from "../../../img/test/analytics.svg";
import { InfoBox } from "../../components/box/InfoBox";
import { Body } from "../../components/core/typography/Body";
import { Label } from "../../components/core/typography/Label";
import { IOColors } from "../../components/core/variables/IOColors";
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
    <View style={[styles.content, IOStyles.horizontalContentPadding]}>
      <Fingerprint width={32} height={32} />
      <Fingerprint width={64} height={64} />
      <Fingerprint width={128} height={128} />
    </View>
    <View style={[styles.content, IOStyles.horizontalContentPadding]}>
      <AlphaChannel width={32} height={32} />
      <AlphaChannel width={64} height={64} />
      <AlphaChannel width={128} height={128} />
    </View>
    <View style={[styles.content, IOStyles.horizontalContentPadding]}>
      <Analytics width={32} height={32} fill={IOColors.aqua} />
      <Analytics width={64} height={64} fill={IOColors.red} />
      <Analytics width={128} height={128} fill={IOColors.orange} />
    </View>
    <View spacer={true} extralarge={true} />
  </ShowroomSection>
);
