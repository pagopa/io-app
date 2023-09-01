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
  IconButton,
  ListItemInfo
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { ITW_ROUTES } from "../../navigation/ItwRoutes";
import ScreenContent from "../../../../components/screens/ScreenContent";
import I18n from "../../../../i18n";

/**
 * Renders the screen which displays the information about the authentication process to obtain a Wallet Instance.
 */
const ItwDiscoveryProviderInfoScreen = () => {
  const navigation = useNavigation();

  // All this data should be retrieved from the backend
  // but for POC purposes we are using a static list
  // NOTE: the design proposed could be different from
  // the one implemented here
  const PROVIDERS_LIST_ALL: ReadonlyArray<ListItemInfo> = [
    {
      label: I18n.t("features.itWallet.featuresInfoScreen.list.cie"),
      value: I18n.t("features.itWallet.featuresInfoScreen.list.cieSubTitle"),
      icon: "cie",
      action: (
        <IconButton
          icon="chevronRight"
          onPress={() => navigation.navigate(ITW_ROUTES.ISSUING.PID_AUTH_INFO)}
          accessibilityLabel={""}
        />
      ),
      accessibilityLabel: I18n.t(
        "features.itWallet.featuresInfoScreen.list.cie"
      )
    }
  ];

  const PROVIDERS_LIST_MAIN: ReadonlyArray<ListItemInfo> = [
    {
      label: I18n.t("features.itWallet.featuresInfoScreen.list.spid"),
      value: I18n.t("features.itWallet.featuresInfoScreen.list.spidSubTitle"),
      icon: "spid",
      action: (
        <IconButton
          icon="chevronRight"
          onPress={() => undefined}
          accessibilityLabel={""}
        />
      ),
      accessibilityLabel: I18n.t(
        "features.itWallet.featuresInfoScreen.list.spid"
      )
    }
  ];

  const PROVIDERS_LIST_COMING: ReadonlyArray<ListItemInfo> = [
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

  const PROVIDER_SECTION_DATA = [
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
      data: PROVIDERS_LIST_MAIN
    },
    {
      data: PROVIDERS_LIST_COMING
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

        {title ===
          I18n.t(
            "features.itWallet.featuresInfoScreen.list.allFeaturesSection"
          ) && (
          <Badge
            text={I18n.t(
              "features.itWallet.featuresInfoScreen.list.suggestedFeature"
            )}
            variant="turquoise"
          />
        )}
      </View>
    );

  const renderItem = ({ item, index }: ListRenderItemInfo<ListItemInfo>) => (
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
      <ListItemInfo {...item} action={item.action} key={index} />
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
                paddingTop: IOVisualCostants.appMarginDefault
              }
            ]}
            renderItem={renderItem}
            renderSectionHeader={renderHeaderSection}
            ItemSeparatorComponent={() => <Divider />}
            sections={PROVIDER_SECTION_DATA}
          />
        </ScreenContent>
        <View style={{ alignSelf: "center" }}>
          <ButtonLink
            icon="info"
            onPress={() => undefined}
            label={I18n.t(
              "features.itWallet.featuresInfoScreen.compareFeatures"
            )}
            accessibilityLabel={I18n.t(
              "features.itWallet.featuresInfoScreen.compareFeatures"
            )}
          />
        </View>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ItwDiscoveryProviderInfoScreen;
