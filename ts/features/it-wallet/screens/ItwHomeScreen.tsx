import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import ROUTES from "../../../navigation/routes";
import I18n from "../../../i18n";
import { ContextualHelpPropsMarkdown } from "../../../components/screens/BaseScreenComponent";
import { ItwActionBanner } from "../components/ItwActionBanner";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BadgeButton from "../components/design/BadgeButton";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.contextualHelpTitle",
  body: "wallet.contextualHelpContent"
};
/**
 * IT-Wallet home screen which contains a top bar with categories, an activation banner and a list of wallet items based on the selected category.
 */
const ItwHomeScreen = () => {
  const navigation = useNavigation();
  const [selectedBadgeIdx, setSelectedBadgeIdx] = useState(0);
  const badgesLabels = [
    I18n.t("features.itWallet.homeScreen.categories.any"),
    I18n.t("features.itWallet.homeScreen.categories.personal"),
    I18n.t("features.itWallet.homeScreen.categories.cgn"),
    I18n.t("features.itWallet.homeScreen.categories.payments")
  ];

  return (
    <SafeAreaView style={IOStyles.flex}>
      <TopScreenComponent
        accessibilityLabel={I18n.t("global.navigator.wallet")}
        faqCategories={["wallet"]} // temporary until faq is implemented
        contextualHelpMarkdown={contextualHelpMarkdown} // temporary until contextual help is implemented
        isSearchAvailable={{
          enabled: true,
          searchType: "Messages",
          onSearchTap: () => null
        }} // temporary until search is implemented
        isProfileAvailable={{
          enabled: true,
          onProfileTap: () =>
            navigation.getParent()?.navigate(ROUTES.PROFILE_NAVIGATOR)
        }}
        sectionTitle={I18n.t("global.navigator.wallet")}
      >
        <View style={IOStyles.horizontalContentPadding}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {badgesLabels.map((label, idx) => (
              <BadgeButton
                key={`badge-${idx}`}
                text={label}
                variant={selectedBadgeIdx === idx ? "default" : "contrast"}
                accessibilityLabel={label}
                onPress={() => setSelectedBadgeIdx(idx)}
              />
            ))}
          </ScrollView>
          <ItwActionBanner
            title={I18n.t("features.itWallet.innerActionBanner.title")}
            content={I18n.t("features.itWallet.innerActionBanner.description")}
            action={I18n.t("features.itWallet.innerActionBanner.action")}
            labelClose={I18n.t("features.itWallet.innerActionBanner.hideLabel")}
          />
        </View>
      </TopScreenComponent>
    </SafeAreaView>
  );
};
export default ItwHomeScreen;
