import { Alert, VStack } from "@pagopa/io-app-design-system";
import React from "react";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import ItwMarkdown from "../../common/components/ItwMarkdown";
import {
  getCredentialExpireDays,
  getCredentialExpireStatus
} from "../../common/utils/itwClaimsUtils";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import I18n from "../../../../i18n";

type Props = {
  credential: StoredCredential;
};

export const ItwPresentationBannersSection = ({ credential }: Props) => {
  const isMdl = credential.credentialType === CredentialType.DRIVING_LICENSE;

  const mdlDisclaimerBottomSheet = useIOBottomSheetAutoresizableModal({
    title: I18n.t("features.itWallet.presentation.bottomSheets.mdl.title"),
    component: (
      <ItwMarkdown>
        {I18n.t("features.itWallet.presentation.bottomSheets.mdl.content")}
      </ItwMarkdown>
    )
  });

  const expireStatus = getCredentialExpireStatus(credential.parsedCredential);
  const expireDays = getCredentialExpireDays(credential.parsedCredential);

  if (expireStatus === "expired") {
    return (
      <Alert
        content={I18n.t(
          "features.itWallet.presentation.alerts.expired.content"
        )}
        variant="error"
        action={I18n.t("features.itWallet.presentation.alerts.expired.action")}
        onPress={mdlDisclaimerBottomSheet.present}
      />
    );
  }

  return (
    <VStack space={16}>
      {expireStatus === "expiring" && (
        <Alert
          content={I18n.t(
            "features.itWallet.presentation.alerts.expiring.content",
            {
              days: expireDays
            }
          )}
          variant="warning"
        />
      )}
      {isMdl && (
        <>
          <Alert
            content={I18n.t(
              "features.itWallet.presentation.alerts.mdl.content"
            )}
            variant="info"
            action={I18n.t("features.itWallet.presentation.alerts.mdl.action")}
            onPress={mdlDisclaimerBottomSheet.present}
          />
          {mdlDisclaimerBottomSheet.bottomSheet}
        </>
      )}
    </VStack>
  );
};
