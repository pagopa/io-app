import { IOColors, Icon, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";
import { RawAccordion } from "../../../components/core/accordion/RawAccordion";
import { Body } from "../../../components/core/typography/Body";
import { H3 } from "../../../components/core/typography/H3";
import { H5 } from "../../../components/core/typography/H5";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

export const DSLegacyAccordion = () => (
  <DesignSystemScreen title={"Legacy Accordion"}>
    {renderRawAccordion()}
  </DesignSystemScreen>
);

const renderRawAccordion = () => (
  <>
    <H3>RawAccordion</H3>
    <VSpacer size={16} />
    <View style={[IOStyles.flex, { width: "100%" }]}>
      <RawAccordion
        headerStyle={{
          paddingVertical: 16,
          backgroundColor: IOColors.greyLight
        }}
        header={
          <View style={IOStyles.row}>
            <Icon name="productIOApp" size={24} color="grey-650" />
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
  </>
);
