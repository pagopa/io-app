import { Body, H6, Pictogram, VStack } from "@io-app/design-system";
import I18n from "i18next";
import { View } from "react-native";

/**
 * Empty state shown after all saved consents for a credential have been
 * revoked. The management entry point remains available by design.
 */
export const ItwConsentManagementEmptyState = () => (
  <View testID="consent-empty-state">
    <VStack space={16} style={{ alignItems: "center" }}>
      <Pictogram name="empty" size={120} />
      <H6 accessibilityRole="header">
        {I18n.t(
          "features.itWallet.presentation.proximity.consentManagement.empty.title"
        )}
      </H6>
      <Body>
        {I18n.t(
          "features.itWallet.presentation.proximity.consentManagement.empty.subtitle"
        )}
      </Body>
    </VStack>
  </View>
);
