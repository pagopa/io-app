import React, { useState } from "react";
import { FlatList, SafeAreaView, View } from "react-native";
import {
  Badge,
  H2,
  IOStyles,
  Icon,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import ItwSearchBar from "../../components/ItwSearchBar";
import I18n from "../../../../i18n";
import { CREDENTIALS_CATALOG, CredentialCatalogItem } from "../../utils/mocks";
import ListItemLoadingItw from "../../components/ListItems/ListItemLoadingItw";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ITW_ROUTES } from "../../navigation/ItwRoutes";

/**
 * Default index for the loading state.
 */
const DEFAULT_INDEX = -1;

/**
 * Renders a preview screen which displays a visual representation and the claims contained in the PID.
 */
const ItwCredentialsCatalogScreen = () => {
  const [loadingIndex, setLoadingIndex] = useState(DEFAULT_INDEX);
  const navigation = useNavigation<IOStackNavigationProp<ItwParamsList>>();

  const onCredentialPress = (
    index: number,
    catalogItem: CredentialCatalogItem
  ) => {
    setLoadingIndex(index);
    setTimeout(() => {
      setLoadingIndex(DEFAULT_INDEX);
      navigation.navigate(ITW_ROUTES.CREDENTIALS.ADD_CHECKS, {
        credential: catalogItem
      });
    }, 1500);
  };

  /**
   * Renders a single credential catalog item in a FlatList.
   * @param catalogItem: the catalog item to render.
   */
  const RenderItem = ({
    catalogItem,
    index
  }: {
    catalogItem: CredentialCatalogItem;
    index: number;
  }) => (
    <>
      <ListItemLoadingItw
        onPress={() => onCredentialPress(index, catalogItem)}
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
        loading={loadingIndex === index}
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
        renderItem={({ item, index }) => (
          <RenderItem index={index} catalogItem={item} />
        )}
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
