import { ListItemNav } from "@io-app/design-system";
import I18n from "i18next";

import { format } from "../../../../../utils/dates";
import { StoredConsentData } from "../store/types";

type Props = {
  consent: StoredConsentData;
  onPress: () => void;
};

/**
 * Formats the date on which a consent was saved. Legacy consents do not have
 * this information and intentionally omit the description instead of showing
 * an inferred date.
 */
export const getConsentSavedAtDescription = (
  savedAt: string | undefined
): string | undefined => {
  if (!savedAt) {
    return undefined;
  }

  const date = new Date(savedAt);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return I18n.t(
    "features.itWallet.presentation.proximity.consentManagement.savedAt",
    { date: format(date, "D MMM YYYY") }
  );
};

/** A saved-consent row. Multiple rows for the same RP are intentional. */
export const ItwConsentManagementListItem = ({ consent, onPress }: Props) => (
  <ListItemNav
    accessibilityLabel={I18n.t(
      "features.itWallet.presentation.proximity.consentManagement.accessibility.openDetail",
      {
        relyingParty: consent.rpDisplayName ?? consent.rpId
      }
    )}
    description={getConsentSavedAtDescription(consent.savedAt)}
    icon="institution"
    onPress={onPress}
    value={consent.rpDisplayName ?? consent.rpId}
  />
);
