import { View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import AlphaChannel from "../../../img/test/alphaChannel.svg";
import Fingerprint from "../../../img/test/fingerprint.svg";
import Analytics from "../../../img/test/analytics.svg";
import { InfoBox } from "../../components/box/InfoBox";
import { IOAccordion } from "../../components/core/accordion/IOAccordion";
import { RawAccordion } from "../../components/core/accordion/RawAccordion";
import { Body } from "../../components/core/typography/Body";
import { H3 } from "../../components/core/typography/H3";
import { H5 } from "../../components/core/typography/H5";
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
    <Label>{"<InfoBox />"}</Label>
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
    <Label>{"<IOAccordion />"}</Label>
    <View style={[IOStyles.flex, { width: "100%" }]}>
      <IOAccordion title={"Animated Accordion"}>
        <AlphaChannel width={128} height={128} />
      </IOAccordion>
      <IOAccordion title={"Accordion without animation"} animated={false}>
        <Analytics width={128} height={128} fill={IOColors.orange} />
      </IOAccordion>
      <IOAccordion title={"Accordion with a very very very very long text"}>
        <>
          <Analytics width={128} height={128} fill={IOColors.orange} />
          <Analytics width={128} height={128} fill={IOColors.orange} />
        </>
      </IOAccordion>
    </View>
    <View spacer={true} extralarge={true} />
    <Label>{"<RawAccordion />"}</Label>
    <View spacer={true} />
    <View style={[IOStyles.flex, { width: "100%" }]}>
      <RawAccordion
        headerStyle={{
          paddingVertical: 16,
          backgroundColor: IOColors.greyLight
        }}
        header={
          <View style={IOStyles.row}>
            <Fingerprint width={32} height={32} />
            <H3 style={{ alignSelf: "center" }}>{"Custom header "}</H3>
            <H5 style={{ alignSelf: "center" }}>{"Purgatorio, Canto VI"}</H5>
          </View>
        }
      >
        <Body>
          {"Ahi serva Italia, di dolore ostello, \n" +
            "nave sanza nocchiere in gran tempesta, \n" +
            "non donna di province, ma bordello!" +
            "\n\n" +
            "Quell’anima gentil fu così presta, \n" +
            "sol per lo dolce suon de la sua terra, \n" +
            "di fare al cittadin suo quivi festa;" +
            "\n\n" +
            "e ora in te non stanno sanza guerra \n" +
            "li vivi tuoi, e l’un l’altro si rode \n" +
            "di quei ch’un muro e una fossa serra." +
            "\n\n" +
            "Cerca, misera, intorno da le prode \n" +
            "le tue marine, e poi ti guarda in seno, \n" +
            "s’alcuna parte in te di pace gode." +
            "\n\n" +
            "Che val perché ti racconciasse il freno \n" +
            "Iustiniano, se la sella è vota? \n" +
            "Sanz’esso fora la vergogna meno."}
        </Body>
      </RawAccordion>
    </View>
  </ShowroomSection>
);
