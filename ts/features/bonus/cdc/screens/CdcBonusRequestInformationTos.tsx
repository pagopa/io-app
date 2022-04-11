import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { H1 } from "../../../../components/core/typography/H1";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";

const CdcBonusRequestInformationTos = () => (
  <BaseScreenComponent
    goBack={false}
    contextualHelp={emptyContextualHelp}
    headerTitle={"Cdc bonus"}
  >
    <SafeAreaView style={IOStyles.flex}>
      <ScrollView style={[IOStyles.horizontalContentPadding]}>
        <H1>{"CdcBonusRequestInformationTos"}</H1>
      </ScrollView>
    </SafeAreaView>
  </BaseScreenComponent>
);

export default CdcBonusRequestInformationTos;
