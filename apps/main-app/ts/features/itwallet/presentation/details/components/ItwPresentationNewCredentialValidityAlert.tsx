import { Banner } from "@io-app/design-system";
import I18n from "i18next";
import { useMemo } from "react";

import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { itwCloseBanner } from "../../../common/store/actions/banners";
import { getNewCredentialValidityBannerId } from "../../../common/store/reducers/banners";
import { itwIsBannerVisibleSelector } from "../../../common/store/selectors/banners";
import { NewCredential } from "../../../common/utils/itwCredentialUtils";
import { CredentialType } from "../../../common/utils/itwMocksUtils";

type Props = {
  credentialType: ValidityAlertCredential;
};

/**
 * proof_of_age is a new credential but shows its own usage banner instead of this generic
 * validity alert, so it is excluded here (no validity message exists for it).
 */
type ValidityAlertCredential = Exclude<
  NewCredential,
  CredentialType.PROOF_OF_AGE
>;

/**
 * Dismissable banner showing information about the validity of new IT Wallet credentials.
 * Each credential type is tracked with its own persisted banner id (see
 * `getNewCredentialValidityBannerId`), so dismissing it for one credential does not hide
 * it for the others, including credential types added in the future.
 */
export const ItwPresentationNewCredentialValidityAlert = ({
  credentialType
}: Props) => {
  const dispatch = useIODispatch();
  const bannerId = getNewCredentialValidityBannerId(credentialType);
  const isBannerVisible = useIOSelector(itwIsBannerVisibleSelector(bannerId));

  const content = useMemo(() => {
    switch (credentialType) {
      case CredentialType.EDUCATION_ATTENDANCE:
        return I18n.t(
          "features.itWallet.presentation.credentialDetails.newCredentialValidityAlert.content.education_attendance"
        );
      case CredentialType.EDUCATION_DEGREE:
        return I18n.t(
          "features.itWallet.presentation.credentialDetails.newCredentialValidityAlert.content.education_degree"
        );
      case CredentialType.EDUCATION_DIPLOMA:
        return I18n.t(
          "features.itWallet.presentation.credentialDetails.newCredentialValidityAlert.content.education_diploma"
        );
      case CredentialType.EDUCATION_ENROLLMENT:
        return I18n.t(
          "features.itWallet.presentation.credentialDetails.newCredentialValidityAlert.content.education_enrollment"
        );
      case CredentialType.RESIDENCY:
        return I18n.t(
          "features.itWallet.presentation.credentialDetails.newCredentialValidityAlert.content.residency"
        );
    }
  }, [credentialType]);

  if (!isBannerVisible) {
    return null;
  }

  return (
    <Banner
      color="neutral"
      content={content}
      labelClose={I18n.t("global.buttons.close")}
      onClose={() => dispatch(itwCloseBanner(bannerId))}
      pictogramName="premiumCredentials"
      testID="newCredentialAlertTestID"
      title={I18n.t(
        "features.itWallet.presentation.credentialDetails.newCredentialValidityAlert.title"
      )}
    />
  );
};
