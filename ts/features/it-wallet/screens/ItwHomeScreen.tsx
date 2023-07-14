import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import ROUTES from "../../../navigation/routes";
import I18n from "../../../i18n";
import { ContextualHelpPropsMarkdown } from "../../../components/screens/BaseScreenComponent";
import { ItwActionBanner } from "../components/ItwActionBanner";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BadgeButton from "../components/design/BadgeButton";
import { useIOSelector } from "../../../store/hooks";
import {
  ItwWalletActivatedSelector,
  ItwWalletVcsSelector
} from "../store/reducers/itwCredentials";
import PidCredential from "../components/PidCredential";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { ITW_ROUTES } from "../navigation/routes";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.contextualHelpTitle",
  body: "wallet.contextualHelpContent"
};
/**
 * IT-Wallet home screen which contains a top bar with categories, an activation banner and a list of wallet items based on the selected category.
 */
const ItwHomeScreen = () => {
  const navigation = useNavigation();
  const isWalletActive = useIOSelector(ItwWalletActivatedSelector);
  const [selectedBadgeIdx, setSelectedBadgeIdx] = useState(0);
  const pid = useIOSelector(ItwWalletVcsSelector)[0].verified_claims.claims;
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
        </View>
        <View
          style={{ ...IOStyles.flex, ...IOStyles.horizontalContentPadding }}
        >
          <ScrollView style={{ flex: 1 }}>
            {!isWalletActive && (
              <ItwActionBanner
                title={I18n.t("features.itWallet.innerActionBanner.title")}
                content={I18n.t(
                  "features.itWallet.innerActionBanner.description"
                )}
                action={I18n.t("features.itWallet.innerActionBanner.action")}
                labelClose={I18n.t(
                  "features.itWallet.innerActionBanner.hideLabel"
                )}
              />
            )}
            {isWalletActive &&
              (selectedBadgeIdx === 0 || selectedBadgeIdx === 1) && (
                <>
                  <VSpacer />
                  <Pressable
                    onPress={() =>
                      navigation.navigate(ITW_ROUTES.MAIN, {
                        screen: ITW_ROUTES.PRESENTATION.VC_DETAILS
                      })
                    }
                  >
                    <PidCredential
                      name={`${pid.given_name} ${pid.family_name}`}
                      fiscalCode={pid.tax_id_number}
                    />
                  </Pressable>
                </>
              )}
          </ScrollView>
        </View>
      </TopScreenComponent>
    </SafeAreaView>
  );
};
export default ItwHomeScreen;
