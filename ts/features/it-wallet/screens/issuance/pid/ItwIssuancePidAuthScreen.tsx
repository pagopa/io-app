import * as React from "react";
import {
  SectionList,
  ListRenderItemInfo,
  SafeAreaView,
  View,
  ScrollView
} from "react-native";
import {
  Badge,
  ButtonLink,
  Divider,
  H2,
  H6,
  IOVisualCostants,
  Icon,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import { constNull } from "fp-ts/lib/function";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { ITW_ROUTES } from "../../../navigation/ItwRoutes";
import I18n from "../../../../../i18n";
import ListItemItw from "../../../components/ListItems/ListItemItw";
import { useItwInfoBottomSheet } from "../../../hooks/useItwInfoBottomSheet";

/**
 * Renders the screen which display a list of features (or trusty providers)
 * to activate the wallet.
 */
const ItwIssuancePidAuthScreen = () => {
  const navigation = useNavigation();

  const { present, bottomSheet } = useItwInfoBottomSheet({
    title: I18n.t("features.itWallet.featuresInfoScreen.showDiff.title"),
    content: [
      {
        body: I18n.t("features.itWallet.featuresInfoScreen.showDiff.content")
      }
    ]
  });

  // All this data should be fetched from remote
  // but for POC purposes we are using a static list
  // NOTE: the design proposed could be different from
  // the one implemented here
  const PROVIDERS_LIST_ALL: ReadonlyArray<ListItemItw> = [
    {
      title: I18n.t("features.itWallet.featuresInfoScreen.list.cie"),
      subTitle: I18n.t("features.itWallet.featuresInfoScreen.list.cieSubTitle"),
      icon: "fiscalCodeIndividual",
      onPress: () => navigation.navigate(ITW_ROUTES.ISSUANCE.PID.AUTH_INFO),
      accessibilityLabel: I18n.t(
        "features.itWallet.featuresInfoScreen.list.cie"
      ),
      rightNode: <Icon name="chevronRight" size={24} color={"blueIO-500"} />
    }
  ];

  const FEATURES_LIST_MAIN: ReadonlyArray<ListItemItw> = [];

  // Here we have a different type of list item because not
  // all the components are available yet. See comment below.
  const FEATURES_LIST_COMING: ReadonlyArray<ListItemItw> = [
    {
      title: I18n.t("features.itWallet.featuresInfoScreen.list.spid"),
      subTitle: I18n.t(
        "features.itWallet.featuresInfoScreen.list.spidSubTitle"
      ),
      icon: "spid",
      rightNode: (
        <Badge
          text={I18n.t(
            "features.itWallet.featuresInfoScreen.list.incomingFeature"
          )}
          variant="default"
        />
      ),
      accessibilityLabel: I18n.t(
        "features.itWallet.featuresInfoScreen.list.spid"
      ),
      onPress: () => constNull
    },
    {
      title: I18n.t("features.itWallet.featuresInfoScreen.list.cieId"),
      subTitle: I18n.t(
        "features.itWallet.featuresInfoScreen.list.cieIdSubTitle"
      ),
      icon: "device",
      rightNode: (
        <Badge
          text={I18n.t(
            "features.itWallet.featuresInfoScreen.list.incomingFeature"
          )}
          variant="default"
        />
      ),
      accessibilityLabel: I18n.t(
        "features.itWallet.featuresInfoScreen.list.cieId"
      ),
      onPress: () => constNull
    }
  ];

  type FeaturesSectionData = {
    title?: string;
    data: ReadonlyArray<ListItemItw>;
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
        <H6 style={{ flex: 1 }} color={"bluegrey"}>
          {title}
        </H6>
      </View>
    );

  // The following function is used to render the list items
  // based on the type of the item. Please note that the design system
  // provides two different components for the list items. Next
  // should be defined a new component or a variant of ListItem to
  // have the expected design.
  const renderItem = ({ item, index }: ListRenderItemInfo<ListItemItw>) => (
    <>
      <ListItemItw {...item} key={index} />
      <VSpacer size={8} />
    </>
  );

  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView>
          <H2 style={IOStyles.horizontalContentPadding}>
            {I18n.t("features.itWallet.featuresInfoScreen.title")}
          </H2>
          <SectionList
            keyExtractor={(item, index) => `${item.title}-${index}`}
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
              onPress={() => present()}
              label={I18n.t(
                "features.itWallet.featuresInfoScreen.compareFeatures"
              )}
              accessibilityLabel={I18n.t(
                "features.itWallet.featuresInfoScreen.compareFeatures"
              )}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
      {bottomSheet}
    </BaseScreenComponent>
  );
};

export default ItwIssuancePidAuthScreen;
