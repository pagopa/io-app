import React from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Badge, IOStyles, Icon, VSpacer } from "@pagopa/io-app-design-system";
import { IOStackNavigationProp } from "../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../navigation/ItwParamsList";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { ListItemItw } from "../components/ListItemItw";
import ScreenContent from "../../../components/screens/ScreenContent";

/**
 * Renders a preview screen which displays a visual representation and the claims contained in the PID.
 */
const ItwCredentialsCatalogScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();

  /**
   * Renders the content of the screen if the PID is decoded.
   * @param decodedPip - the decoded PID
   */
  const ContentView = () => (
    <ScrollView contentContainerStyle={IOStyles.horizontalContentPadding}>
      <ListItemItw
        onPress={() => null}
        accessibilityLabel="Tessera 1"
        title="Tessera 1"
        icon="disabilityCard"
        rightNode={<Icon name="chevronRight" />}
      />
      <VSpacer />
      <ListItemItw
        onPress={() => null}
        accessibilityLabel="Tessera 2"
        title="Tessera 2"
        icon="healthCard"
        rightNode={<Icon name="chevronRight" />}
      />
      <VSpacer />
      <ListItemItw
        onPress={() => null}
        accessibilityLabel="Tessera 3"
        title="Tessera 3"
        icon="driverLicense"
        rightNode={<Badge text="In Arrivo" variant="success" />}
        disabled
      />
    </ScrollView>
  );

  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <SafeAreaView style={IOStyles.flex}>
        <ScreenContent title="Aggiungi altre tessere">
          <ContentView />
        </ScreenContent>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ItwCredentialsCatalogScreen;
