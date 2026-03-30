import {
  Divider,
  IOButton,
  IOVisualCostants,
  VStack
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { StyleSheet, View } from "react-native";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIONavigation } from "../../../../navigation/params/AppParamsList.ts";
import { useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/contextualHelp.ts";
import { trackShowCredentialsList } from "../../analytics";
import { l2Credentials } from "../../common/utils/itwCredentialUtils.ts";
import { itwCredentialsByPresenceSelector } from "../../credentials/store/selectors/index.ts";
import { ITW_ROUTES } from "../../navigation/routes.ts";
import { ItwOnboardingModuleCredentialsList } from "../components/ItwOnboardingModuleCredentialsList.tsx";
import { AsyncCredentialsCatalogue } from "../components/AsyncCredentialsCatalogueWrapper.tsx";

const ItwCardOnboardingL2Screen = () => {
  useFocusEffect(trackShowCredentialsList);

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("features.itWallet.onboarding.restrictedMode.title")
      }}
      description={I18n.t(
        "features.itWallet.onboarding.restrictedMode.description"
      )}
      contextualHelp={emptyContextualHelp}
      faqCategories={["wallet", "wallet_methods"]}
      headerActionsProp={{ showHelp: true }}
    >
      <View style={styles.wrapper}>
        <ItwL2CredentialOnboardingSection />
      </View>
    </IOScrollViewWithLargeHeader>
  );
};

const ItwL2CredentialOnboardingSection = () => {
  const navigation = useIONavigation();

  const { notObtained } = useIOSelector(state =>
    itwCredentialsByPresenceSelector(state, l2Credentials)
  );

  return (
    <View testID="restricted-mode-section-testID">
      <VStack space={24}>
        <AsyncCredentialsCatalogue>
          <ItwOnboardingModuleCredentialsList
            credentialTypesToDisplay={notObtained}
            isRestrictedMode
          />
        </AsyncCredentialsCatalogue>
        <Divider />
        <IOButton
          testID="add-bonus-action-testID"
          variant="link"
          label={I18n.t("features.wallet.onboarding.cta.addBonus")}
          accessibilityLabel={I18n.t("features.wallet.onboarding.cta.addBonus")}
          onPress={() => {
            navigation.replace(ITW_ROUTES.MAIN, {
              screen: ITW_ROUTES.L3_ONBOARDING,
              params: { page: 1 }
            });
          }}
          numberOfLines={2}
        />
      </VStack>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 16,
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    gap: 16
  }
});

export { ItwCardOnboardingL2Screen };
