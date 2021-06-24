import * as React from "react";
import { ScrollView } from "react-native";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../utils/emptyContextualHelp";
import { IOStyles } from "../../components/core/variables/IOStyles";
import I18n from "../../i18n";
import ServicesContactComponent from "./components/services/ServicesContactComponent";

const ServicesPreferenceScreen = (): React.ReactElement => (
  <BaseScreenComponent
    goBack={true}
    contextualHelp={emptyContextualHelp}
    headerTitle={I18n.t("profile.preferences.list.service_contact")}
  >
    <ScrollView style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
      <ServicesContactComponent />
    </ScrollView>
  </BaseScreenComponent>
);

export default ServicesPreferenceScreen;
