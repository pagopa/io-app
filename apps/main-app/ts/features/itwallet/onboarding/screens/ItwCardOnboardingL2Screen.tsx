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
import { isL2Credential } from "../../common/utils/itwCredentialUtils.ts";
import { makeItwCredentialsByPresenceSelector } from "../../credentials/store/selectors/index.ts";
import { itwAvailableCredentialsListSelector } from "../../credentialsCatalogue/store/selectors/index.ts";
import { ITW_ROUTES } from "../../navigation/routes.ts";
import { AsyncCredentialsCatalogue } from "../components/AsyncCredentialsCatalogueWrapper.tsx";
import { ItwOnboardingModuleCredentialsList } from "../components/ItwOnboardingModuleCredentialsList.tsx";

const ItwCardOnboardingL2Screen = () => {
  useFocusEffect(trackShowCredentialsList);

  return (
    <IOScrollViewWithLargeHeader
      contextualHelp={emptyContextualHelp}
      description={I18n.t(
        "features.itWallet.onboarding.restrictedMode.description"
      )}
      faqCategories={["wallet", "wallet_methods"]}
      headerActionsProp={{ showHelp: true }}
      title={{
        label: I18n.t("features.itWallet.onboarding.restrictedMode.title")
      }}
    >
      <View style={styles.wrapper}>
        <ItwL2CredentialOnboardingSection />
      </View>
    </IOScrollViewWithLargeHeader>
  );
};

const ItwL2CredentialOnboardingSection = () => {
  const navigation = useIONavigation();

  const catalogueCredentials = useIOSelector(
    itwAvailableCredentialsListSelector
  );
  const l2Credentials = catalogueCredentials.filter(c =>
    isL2Credential(c.type)
  );

  const { notObtained } = useIOSelector(
    makeItwCredentialsByPresenceSelector(l2Credentials)
  );

  return (
    <View testID="restricted-mode-section-testID">
      <VStack space={24}>
        <AsyncCredentialsCatalogue>
          <ItwOnboardingModuleCredentialsList
            credentialsToDisplay={notObtained}
            isL2Credential
          />
        </AsyncCredentialsCatalogue>
        <Divider />
        <IOButton
          accessibilityLabel={I18n.t("features.wallet.onboarding.cta.addBonus")}
          label={I18n.t("features.wallet.onboarding.cta.addBonus")}
          numberOfLines={2}
          onPress={() => {
            navigation.replace(ITW_ROUTES.MAIN, {
              screen: ITW_ROUTES.L3_ONBOARDING,
              params: { page: 1 }
            });
          }}
          testID="add-bonus-action-testID"
          variant="link"
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
