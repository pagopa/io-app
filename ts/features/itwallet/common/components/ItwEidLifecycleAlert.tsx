import { Alert } from "@pagopa/io-app-design-system";
import { format } from "date-fns";
import { sequenceT } from "fp-ts/lib/Apply";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ComponentProps, useMemo } from "react";
import { View } from "react-native";
import I18n from "i18next";
import { useIOSelector } from "../../../../store/hooks";
import {
  itwCredentialsEidSelector,
  itwCredentialsEidStatusSelector
} from "../../credentials/store/selectors";
import {
  ItwJwtCredentialStatus,
  StoredCredential
} from "../utils/itwTypesUtils";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { ITW_ROUTES } from "../../navigation/routes";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
import { offlineAccessReasonSelector } from "../../../ingress/store/selectors";

const defaultLifecycleStatus: Array<ItwJwtCredentialStatus> = [
  "valid",
  "jwtExpiring",
  "jwtExpired"
];

type Props = {
  /**
   * The eID statuses that will render the alert.
   */
  lifecycleStatus?: Array<ItwJwtCredentialStatus>;
  navigation: ReturnType<typeof useIONavigation>;
};

/**
 * This component renders an alert that displays information on the eID status.
 */
export const ItwEidLifecycleAlert = ({
  lifecycleStatus = defaultLifecycleStatus,
  navigation
}: Props) => {
  const eidOption = useIOSelector(itwCredentialsEidSelector);
  const isItw = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const maybeEidStatus = useIOSelector(itwCredentialsEidStatusSelector);
  const offlineAccessReason = useIOSelector(offlineAccessReasonSelector);

  const startEidReissuing = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTIFICATION.MODE_SELECTION,
      params: {
        eidReissuing: true
      }
    });
  };

  const Content = ({
    eid,
    eidStatus
  }: {
    eid: StoredCredential;
    eidStatus: ItwJwtCredentialStatus;
  }) => {
    const nameSpace = isItw ? "itw" : "documents";

    const alertProps = useMemo<ComponentProps<typeof Alert>>(() => {
      const eIDAlertPropsMap: Record<
        ItwJwtCredentialStatus,
        ComponentProps<typeof Alert>
      > = {
        valid: {
          testID: "itwEidLifecycleAlertTestID_valid",
          variant: "success",
          content: I18n.t(
            `features.itWallet.presentation.bottomSheets.eidInfo.alert.${nameSpace}.valid`,
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
            `features.itWallet.presentation.bottomSheets.eidInfo.alert.${nameSpace}.expiring`,
            // TODO [SIW-3225]: date in bold
            { date: format(eid.jwt.expiration, "DD-MM-YYYY") }
          ),
          action: I18n.t(
            `features.itWallet.presentation.bottomSheets.eidInfo.alert.${nameSpace}.action`
          ),
          onPress: startEidReissuing
        },
        jwtExpired: {
          testID: "itwEidLifecycleAlertTestID_jwtExpired",
          variant: "error",
          content: I18n.t(
            `features.itWallet.presentation.bottomSheets.eidInfo.alert.${nameSpace}.expired`
          ),
          action: I18n.t(
            `features.itWallet.presentation.bottomSheets.eidInfo.alert.${nameSpace}.action`
          ),
          onPress: startEidReissuing
        }
      };

      if (offlineAccessReason !== undefined && !isItw) {
        return {
          testID: "itwEidLifecycleAlertTestID_offline",
          variant: "error",
          content: I18n.t(
            `features.itWallet.presentation.bottomSheets.eidInfo.alert.documents.offline`
          )
        };
      }

      return eIDAlertPropsMap[eidStatus];
    }, [eidStatus, eid.jwt.issuedAt, eid.jwt.expiration, nameSpace]);

    if (!lifecycleStatus.includes(eidStatus)) {
      return null;
    }

    return (
      <View style={{ marginBottom: 16 }} testID={`itwEidLifecycleAlertTestID`}>
        <Alert {...alertProps} />
      </View>
    );
  };

  return pipe(
    sequenceT(O.Monad)(eidOption, O.fromNullable(maybeEidStatus)),
    O.fold(constNull, ([eid, eidStatus]) => (
      <Content eid={eid} eidStatus={eidStatus} />
    ))
  );
};
