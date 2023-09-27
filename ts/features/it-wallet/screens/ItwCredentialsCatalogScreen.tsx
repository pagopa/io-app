import React from "react";
import { FlatList, SafeAreaView, View } from "react-native";
import {
  Badge,
  H2,
  IOStyles,
  Icon,
  VSpacer
} from "@pagopa/io-app-design-system";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp";
import { ListItemItw } from "../components/ListItemItw";
import ItwSearchBar from "../components/ItwSearchBar";
import I18n from "../../../i18n";
import { CREDENTIALS_CATALOG, CredentialCatalogItem } from "../utils/mocks";

/**
 * Renders a preview screen which displays a visual representation and the claims contained in the PID.
 */
const ItwCredentialsCatalogScreen = () => {
  /**
   * Renders a single credential catalog item in a FlatList.
   * @param catalogItem: the catalog item to render.
   */
  const RenderItem = ({
    catalogItem
  }: {
    catalogItem: CredentialCatalogItem;
  }) => (
    <>
      <ListItemItw
        onPress={() => null}
        accessibilityLabel={catalogItem.title}
        title={catalogItem.title}
        icon={catalogItem.icon}
        rightNode={
          catalogItem.incoming ? (
            <Badge
              text={I18n.t(
                "features.itWallet.issuing.credentialsCatalogScreen.incomingFeature"
              )}
              variant="success"
            />
          ) : (
            <Icon name="chevronRight" />
          )
        }
        disabled={catalogItem.incoming}
      />
    </>
  );
  /**
   * Renders the content of the screen if the PID is decoded.
   * @param decodedPip - the decoded PID
   */
  const ContentView = () => (
    <View style={IOStyles.flex}>
      <VSpacer />
      <ItwSearchBar />
      <VSpacer />
      <FlatList
        data={CREDENTIALS_CATALOG}
        renderItem={({ item }) => <RenderItem catalogItem={item} />}
        keyExtractor={(item, index) => `${index}_${item.title}`}
        ItemSeparatorComponent={() => <VSpacer size={8} />}
      />
    </View>
  );

  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <SafeAreaView style={{ ...IOStyles.flex }}>
        <View
          style={{ ...IOStyles.flex, ...IOStyles.horizontalContentPadding }}
        >
          <H2>
            {I18n.t("features.itWallet.issuing.credentialsCatalogScreen.title")}
          </H2>
          <ContentView />
        </View>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ItwCredentialsCatalogScreen;
