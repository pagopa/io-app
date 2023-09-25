import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { Badge, IOStyles, Icon, VSpacer } from "@pagopa/io-app-design-system";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { ListItemItw } from "../components/ListItemItw";
import ScreenContent from "../../../components/screens/ScreenContent";
import ItwSearchBar from "../components/ItwSearchBar";
import I18n from "../../../i18n";

/**
 * Renders a preview screen which displays a visual representation and the claims contained in the PID.
 */
const ItwCredentialsCatalogScreen = () => {
  /**
   * Renders the content of the screen if the PID is decoded.
   * @param decodedPip - the decoded PID
   */
  const ContentView = () => (
    <ScrollView contentContainerStyle={IOStyles.horizontalContentPadding}>
      <VSpacer />
      <ItwSearchBar />
      <VSpacer />
      <ListItemItw
        onPress={() => null}
        accessibilityLabel={I18n.t(
          "features.itWallet.verifiableCredentials.type.disabilityCard"
        )}
        title={I18n.t(
          "features.itWallet.verifiableCredentials.type.disabilityCard"
        )}
        icon="disabilityCard"
        rightNode={<Icon name="chevronRight" />}
      />
      <VSpacer size={8} />
      <ListItemItw
        onPress={() => null}
        accessibilityLabel={I18n.t(
          "features.itWallet.verifiableCredentials.type.healthCard"
        )}
        title={I18n.t(
          "features.itWallet.verifiableCredentials.type.healthCard"
        )}
        icon="healthCard"
        rightNode={<Icon name="chevronRight" />}
      />
      <VSpacer size={8} />
      <ListItemItw
        onPress={() => null}
        accessibilityLabel={I18n.t(
          "features.itWallet.verifiableCredentials.type.drivingLicense"
        )}
        title={I18n.t(
          "features.itWallet.verifiableCredentials.type.drivingLicense"
        )}
        icon="driverLicense"
        rightNode={
          <Badge
            text={I18n.t(
              "features.itWallet.issuing.credentialsCatalogScreen.incomingFeature"
            )}
            variant="success"
          />
        }
        disabled
      />
    </ScrollView>
  );

  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <SafeAreaView style={IOStyles.flex}>
        <ScreenContent
          title={I18n.t(
            "features.itWallet.issuing.credentialsCatalogScreen.title"
          )}
        >
          <ContentView />
        </ScreenContent>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ItwCredentialsCatalogScreen;
