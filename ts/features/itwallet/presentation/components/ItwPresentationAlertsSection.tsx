import { Alert, VStack } from "@pagopa/io-app-design-system";
import React from "react";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import ItwMarkdown from "../../common/components/ItwMarkdown";
import {
  getCredentialExpireDays,
  getCredentialStatus
} from "../../common/utils/itwClaimsUtils";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import I18n from "../../../../i18n";
import { ItwCredentialIssuanceMachineContext } from "../../machine/provider";

type Props = {
  credential: StoredCredential;
};

// When the title is very long, we need to increase the bottom padding to have enough space
const BOTTOM_SHEET_LARGE_BOTTOM_PADDING = 128;

export const ItwPresentationAlertsSection = ({ credential }: Props) => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();

  const beginCredentialIssuance = () => {
    machineRef.send({
      type: "select-credential",
      credentialType: credential.credentialType,
      skipNavigation: false
    });
  };

  const isMdl = credential.credentialType === CredentialType.DRIVING_LICENSE;
  const isEhc =
    credential.credentialType === CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD;

  const disclaimerByCredential: {
    [K in CredentialType]?: { title: string; content: string };
  } = {
    [CredentialType.DRIVING_LICENSE]: {
      title: I18n.t("features.itWallet.presentation.bottomSheets.mdl.title"),
      content: I18n.t("features.itWallet.presentation.bottomSheets.mdl.content")
    },
    [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: {
      title: I18n.t("features.itWallet.presentation.bottomSheets.ehc.title"),
      content: I18n.t("features.itWallet.presentation.bottomSheets.ehc.content")
    }
  } as const;

  const disclaimer =
    disclaimerByCredential[credential.credentialType as CredentialType];

  const disclaimerBottomSheet = useIOBottomSheetAutoresizableModal(
    {
      title: disclaimer?.title ?? "",
      component: <ItwMarkdown>{disclaimer?.content ?? ""}</ItwMarkdown>
    },
    isEhc ? BOTTOM_SHEET_LARGE_BOTTOM_PADDING : undefined
  );

  const expireStatus = getCredentialStatus(credential);
  const expireDays = getCredentialExpireDays(credential.parsedCredential);
  const isExpired = expireStatus === "expired";
  const isExpiring = expireStatus === "expiring";

  if (isExpired) {
    return (
      <Alert
        testID="itwExpiredBannerTestID"
        content={I18n.t(
          "features.itWallet.presentation.alerts.expired.content"
        )}
        variant="error"
        action={I18n.t("features.itWallet.presentation.alerts.expired.action")}
        onPress={beginCredentialIssuance}
      />
    );
  }

  return (
    <VStack space={16}>
      {isExpiring && (
        <Alert
          testID="itwExpiringBannerTestID"
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
            testID="itwMdlBannerTestID"
            content={I18n.t(
              "features.itWallet.presentation.alerts.mdl.content"
            )}
            variant="info"
            action={I18n.t("features.itWallet.presentation.alerts.mdl.action")}
            onPress={disclaimerBottomSheet.present}
          />
          {disclaimerBottomSheet.bottomSheet}
        </>
      )}
      {isEhc && (
        <>
          <Alert
            testID="itwEhcBannerTestID"
            content={I18n.t(
              "features.itWallet.presentation.alerts.ehc.content"
            )}
            variant="info"
            action={I18n.t("features.itWallet.presentation.alerts.ehc.action")}
            onPress={disclaimerBottomSheet.present}
          />
          {disclaimerBottomSheet.bottomSheet}
        </>
      )}
    </VStack>
  );
};
