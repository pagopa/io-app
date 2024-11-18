import { default as React } from "react";
import I18n from "../../../../i18n";
import {
  IOBottomSheetModal,
  useIOBottomSheetAutoresizableModal
} from "../../../../utils/hooks/bottomSheet";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { ItwCredentialTrustmarkBottomSheet } from "../components/ItwCredentialTrustmarkBottomSheet";

export const useItwCredentialTrustmarkBottomSheet = (
  credential: StoredCredential
): IOBottomSheetModal =>
  useIOBottomSheetAutoresizableModal({
    title: I18n.t("features.itWallet.presentation.trustmark.title"),
    component: <ItwCredentialTrustmarkBottomSheet credential={credential} />
  });
