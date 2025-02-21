import { Alert } from "@pagopa/io-app-design-system";
import { format } from "date-fns";
import { sequenceT } from "fp-ts/lib/Apply";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ComponentProps } from "react";
import { View } from "react-native";
import I18n from "../../../../i18n";
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
  const maybeEidStatus = useIOSelector(itwCredentialsEidStatusSelector);

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
    if (!lifecycleStatus.includes(eidStatus)) {
      return null;
    }

    const alertProps: Record<
      ItwJwtCredentialStatus,
      ComponentProps<typeof Alert>
    > = {
      valid: {
        testID: "itwEidLifecycleAlertTestID_valid",
        variant: "success",
        content: I18n.t(
          "features.itWallet.presentation.bottomSheets.eidInfo.alert.valid",
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
          "features.itWallet.presentation.bottomSheets.eidInfo.alert.expiring",
          {
            date: format(eid.jwt.expiration, "DD-MM-YYYY")
          }
        ),
        action: I18n.t(
          "features.itWallet.presentation.bottomSheets.eidInfo.alert.action"
        ),
        onPress: startEidReissuing
      },
      jwtExpired: {
        testID: "itwEidLifecycleAlertTestID_jwtExpired",
        variant: "error",
        content: I18n.t(
          "features.itWallet.presentation.bottomSheets.eidInfo.alert.expired"
        ),
        action: I18n.t(
          "features.itWallet.presentation.bottomSheets.eidInfo.alert.action"
        ),
        onPress: startEidReissuing
      }
    };

    return (
      <View style={{ marginBottom: 16 }} testID={`itwEidLifecycleAlertTestID`}>
        <Alert {...alertProps[eidStatus]} />
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
