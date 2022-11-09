import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { H1 } from "../../../../components/core/typography/H1";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";

const FciDocumentsScreen = () => (
  <BaseScreenComponent goBack={true} headerTitle={"Documenti"}>
    <SafeAreaView style={IOStyles.flex} testID={"FciDocumentsScreenTestID"}>
      <ScrollView style={[IOStyles.horizontalContentPadding]}>
        <H1>{"FciDocumentsScreen"}</H1>
      </ScrollView>
    </SafeAreaView>
  </BaseScreenComponent>
);

export default FciDocumentsScreen;
