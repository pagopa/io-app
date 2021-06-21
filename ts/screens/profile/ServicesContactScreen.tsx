import * as React from "react";
import { ScrollView } from "react-native";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../utils/emptyContextualHelp";
import { IOStyles } from "../../components/core/variables/IOStyles";
import ServicesContactComponent from "./components/services/ServicesContactComponent";

const ServicesContactScreen = (): React.ReactElement => (
  <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
    <ScrollView style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
      <ServicesContactComponent />
    </ScrollView>
  </BaseScreenComponent>
);

export default ServicesContactScreen;
