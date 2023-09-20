import * as React from "react";
import {
  SectionList,
  ListRenderItemInfo,
  SafeAreaView,
  View
} from "react-native";
import {
  Badge,
  ButtonLink,
  Divider,
  H4,
  IOColors,
  IOVisualCostants,
  ListItemInfo,
  ListItemNav
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { ITW_ROUTES } from "../../navigation/ItwRoutes";
import ScreenContent from "../../../../components/screens/ScreenContent";
import I18n from "../../../../i18n";

/**
 * A support function to check the type of the list item.
 * Used to render the correct component based on two type of ListItem.
 * It should be removed when the design system will provide the new component.
 */
const isListItemInfo = (
  item: ListItemInfo | ListItemNav
): item is ListItemInfo => (item as ListItemInfo).action !== undefined;

/**
 * Renders the screen which display a list of features (or trusty providers)
 * to activate the wallet.
 */
const ItwDiscoveryProviderInfoScreen = () => {
  const navigation = useNavigation();

  // All this data should be fetched from remote
  // but for POC purposes we are using a static list
  // NOTE: the design proposed could be different from
  // the one implemented here
  const PROVIDERS_LIST_ALL: ReadonlyArray<ListItemNav> = [
    {
      value: I18n.t("features.itWallet.featuresInfoScreen.list.cie"),
      description: I18n.t(
        "features.itWallet.featuresInfoScreen.list.cieSubTitle"
      ),
      icon: "fiscalCodeIndividual",
      onPress: () => navigation.navigate(ITW_ROUTES.ISSUING.PID_AUTH_INFO),
      accessibilityLabel: I18n.t(
        "features.itWallet.featuresInfoScreen.list.cie"
      )
    }
  ];

  const FEATURES_LIST_MAIN: ReadonlyArray<ListItemNav> = [];

  // Here we have a different type of list item because not
  // all the components are available yet. See comment below.
  const FEATURES_LIST_COMING: ReadonlyArray<ListItemInfo> = [
    {
      label: I18n.t("features.itWallet.featuresInfoScreen.list.spid"),
      value: I18n.t("features.itWallet.featuresInfoScreen.list.spidSubTitle"),
      icon: "spid",
      action: (
        <Badge
          text={I18n.t(
            "features.itWallet.featuresInfoScreen.list.incomingFeature"
          )}
          variant="default"
        />
      ),
      accessibilityLabel: I18n.t(
        "features.itWallet.featuresInfoScreen.list.spid"
      )
    },
    {
      label: I18n.t("features.itWallet.featuresInfoScreen.list.cieId"),
      value: I18n.t("features.itWallet.featuresInfoScreen.list.cieIdSubTitle"),
      icon: "cie",
      action: (
        <Badge
          text={I18n.t(
            "features.itWallet.featuresInfoScreen.list.incomingFeature"
          )}
          variant="default"
        />
      ),
      accessibilityLabel: I18n.t(
        "features.itWallet.featuresInfoScreen.list.cieId"
      )
    }
  ];

  type FeaturesSectionData = {
    title?: string;
    data: ReadonlyArray<ListItemInfo | ListItemNav>;
  };

  const FEATURES_SECTION_DATA: ReadonlyArray<FeaturesSectionData> = [
    {
      title: I18n.t(
        "features.itWallet.featuresInfoScreen.list.allFeaturesSection"
      ),
      data: PROVIDERS_LIST_ALL
    },
    {
      title: I18n.t(
        "features.itWallet.featuresInfoScreen.list.mainFeaturesSection"
      ),
      data: FEATURES_LIST_MAIN
    },
    {
      data: FEATURES_LIST_COMING
    }
  ];

  const renderHeaderSection = ({
    section: { title }
  }: {
    section: { title?: string };
  }) =>
    title && (
      <View
        style={{
          marginBottom: 12,
          marginTop:
            title ===
            I18n.t(
              "features.itWallet.featuresInfoScreen.list.mainFeaturesSection"
            )
              ? 24
              : 0,
          flexDirection: "row"
        }}
      >
        <H4 style={{ flex: 1 }} color={"bluegrey"}>
          {title}
        </H4>
      </View>
    );

  // The following function is used to render the list items
  // based on the type of the item. Please note that the design system
  // provides two different components for the list items. Next
  // should be defined a new component or a variant of ListItem to
  // have the expected design.
  const renderItem = ({
    item,
    index
  }: ListRenderItemInfo<ListItemInfo | ListItemNav>) => (
    <View
      style={{
        borderColor: IOColors.bluegreyLight,
        borderRadius: 8,
        borderWidth: 1,
        paddingLeft: 16,
        paddingRight: 16,
        marginBottom: 8
      }}
    >
      {isListItemInfo(item) ? (
        <ListItemInfo {...item} key={index} />
      ) : (
        <ListItemNav {...item} key={index} onPress={item.onPress} />
      )}
    </View>
  );

  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <SafeAreaView style={IOStyles.flex}>
        <ScreenContent
          title={I18n.t("features.itWallet.featuresInfoScreen.title")}
        >
          <SectionList
            keyExtractor={(item, index) => `${item.value}-${index}`}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={[
              IOStyles.horizontalContentPadding,
              {
                paddingTop: IOVisualCostants.appMarginDefault,
                paddingBottom: IOVisualCostants.appMarginDefault
              }
            ]}
            renderItem={renderItem}
            renderSectionHeader={renderHeaderSection}
            ItemSeparatorComponent={() => <Divider />}
            sections={FEATURES_SECTION_DATA}
          />
          <View style={IOStyles.horizontalContentPadding}>
            <ButtonLink
              onPress={() => undefined}
              label={I18n.t(
                "features.itWallet.featuresInfoScreen.compareFeatures"
              )}
              accessibilityLabel={I18n.t(
                "features.itWallet.featuresInfoScreen.compareFeatures"
              )}
            />
          </View>
        </ScreenContent>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ItwDiscoveryProviderInfoScreen;
