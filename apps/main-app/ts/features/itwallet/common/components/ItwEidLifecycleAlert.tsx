import { Alert } from "@io-app/design-system";
import { format } from "date-fns";
import I18n from "i18next";
import { ComponentProps, useMemo } from "react";
import { View } from "react-native";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { offlineAccessReasonSelector } from "../../../ingress/store/selectors";
import {
  itwAreAllCredentialsExpiredSelector,
  itwCredentialsEidSelector,
  itwCredentialsEidStatusSelector
} from "../../credentials/store/selectors";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../navigation/routes";
import { useItwEidInvalidBottomSheet } from "../hooks/useItwEidInvalidBottomSheet";
import { useItwEidLifecycleAlertTracking } from "../hooks/useItwEidLifecycleAlertTracking";
import { CredentialMetadata, ItwEidStatus } from "../utils/itwTypesUtils";

const defaultLifecycleStatus: Array<ItwEidStatus> = [
  "valid",
  "jwtExpiring",
  "jwtExpired"
];

type Props = {
  /**
   * The name of the current screen, used for analytics tracking and conditional
   * rendering logic (e.g. PID detail screen).
   */
  currentScreenName?: string;
  /** The eID statuses that will render the alert. */
  lifecycleStatus?: Array<ItwEidStatus>;
  navigation: ReturnType<typeof useIONavigation>;
  skipViewTracking?: boolean;
};

/** This component renders an alert that displays information on the eID status. */
export const ItwEidLifecycleAlert = ({
  lifecycleStatus = defaultLifecycleStatus,
  navigation,
  currentScreenName,
  skipViewTracking
}: Props) => {
  const eid = useIOSelector(itwCredentialsEidSelector);
  const isItw = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const maybeEidStatus = useIOSelector(itwCredentialsEidStatusSelector);
  const areAllCredentialsExpired = useIOSelector(
    itwAreAllCredentialsExpiredSelector
  );
  const offlineAccessReason = useIOSelector(offlineAccessReasonSelector);
  const isOffline = offlineAccessReason !== undefined;

  const { trackAlertTap } = useItwEidLifecycleAlertTracking({
    isItwCredential: isItw,
    maybeEidStatus,
    navigation,
    skipViewTracking,
    currentScreenName,
    isOffline
  });

  const navigateToEidReissuing = () =>
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.MODE_SELECTION,
      params: {
        eidReissuing: true,
        level: isItw ? "l3" : "l2"
      }
    });

  const startEidReissuing = () => {
    trackAlertTap();
    navigateToEidReissuing();
  };

  const eidInvalidBottomSheet = useItwEidInvalidBottomSheet(
    navigateToEidReissuing
  );

  const Content = ({
    eid,
    eidStatus,
    isItwCredential
  }: {
    eid: CredentialMetadata;
    eidStatus: ItwEidStatus;
    isItwCredential: boolean;
  }) => {
    const alertProps = useMemo<ComponentProps<typeof Alert>>(() => {
      const eIDAlertPropsMap: Record<
        ItwEidStatus,
        ComponentProps<typeof Alert>
      > = {
        valid: {
          testID: "itwEidLifecycleAlertTestID_valid",
          variant: "success",
          content: I18n.t(
            isItwCredential
              ? "features.itWallet.presentation.bottomSheets.eidInfo.alert.itw.valid"
              : "features.itWallet.presentation.bottomSheets.eidInfo.alert.documents.valid",
            {
              date: eid.jwt.issuedAt
                ? format(eid.jwt.issuedAt, "DD-MM-YYYY")
                : "-"
            }
          )
        },
        jwtExpiring: {
          testID: "itwEidLifecycleAlertTestID_jwtExpiring",
          variant: "warning",
          content: I18n.t(
            isItwCredential
              ? "features.itWallet.presentation.bottomSheets.eidInfo.alert.itw.expiring"
              : "features.itWallet.presentation.bottomSheets.eidInfo.alert.documents.expiring",
            // TODO [SIW-3225]: date in bold
            { date: format(eid.jwt.expiration, "DD-MM-YYYY") }
          ),
          action: I18n.t(
            isItwCredential
              ? "features.itWallet.presentation.bottomSheets.eidInfo.alert.itw.action"
              : "features.itWallet.presentation.bottomSheets.eidInfo.alert.documents.action"
          ),
          onPress: startEidReissuing
        },
        jwtExpired: {
          testID: "itwEidLifecycleAlertTestID_jwtExpired",
          variant: "error",
          content: I18n.t(
            isItwCredential
              ? "features.itWallet.presentation.bottomSheets.eidInfo.alert.itw.expired"
              : "features.itWallet.presentation.bottomSheets.eidInfo.alert.documents.expired"
          ),
          action: I18n.t(
            isItwCredential
              ? "features.itWallet.presentation.bottomSheets.eidInfo.alert.itw.action"
              : "features.itWallet.presentation.bottomSheets.eidInfo.alert.documents.action"
          ),
          onPress: startEidReissuing
        },
        invalid: areAllCredentialsExpired
          ? {
              testID: "itwEidLifecycleAlertTestID_invalid",
              variant: "error",
              content: I18n.t(
                "features.itWallet.presentation.bottomSheets.eidInvalid.alert.allExpired.content"
              ),
              action: I18n.t(
                "features.itWallet.presentation.bottomSheets.eidInvalid.alert.allExpired.action"
              ),
              onPress: startEidReissuing
            }
          : {
              testID: "itwEidLifecycleAlertTestID_invalid",
              variant: "error",
              content: I18n.t(
                "features.itWallet.presentation.bottomSheets.eidInvalid.alert.content"
              ),
              action: I18n.t(
                currentScreenName === ITW_ROUTES.PRESENTATION.PID_DETAIL
                  ? "features.itWallet.presentation.bottomSheets.eidInvalid.alert.action.detail"
                  : "features.itWallet.presentation.bottomSheets.eidInvalid.alert.action.wallet"
              ),
              onPress: eidInvalidBottomSheet.present
            }
      };

      if (offlineAccessReason !== undefined && !isItwCredential) {
        return {
          testID: "itwEidLifecycleAlertTestID_offline",
          variant: "error",
          content: I18n.t(
            "features.itWallet.presentation.bottomSheets.eidInfo.alert.documents.offline"
          )
        };
      }

      const baseProps = eIDAlertPropsMap[eidStatus];

      return baseProps;
    }, [eidStatus, eid.jwt.issuedAt, eid.jwt.expiration, isItwCredential]);

    if (
      !lifecycleStatus.includes(eidStatus) ||
      // The invalid status copy refers to IT-Wallet ID only
      (eidStatus === "invalid" && !isItwCredential)
    ) {
      return null;
    }

    return (
      <View style={{ marginBottom: 16 }} testID={`itwEidLifecycleAlertTestID`}>
        <Alert {...alertProps} />
      </View>
    );
  };

  if (!eid || !maybeEidStatus) {
    return null;
  }

  return (
    <>
      <Content eid={eid} eidStatus={maybeEidStatus} isItwCredential={isItw} />
      {maybeEidStatus === "invalid" && eidInvalidBottomSheet.bottomSheet}
    </>
  );
};
