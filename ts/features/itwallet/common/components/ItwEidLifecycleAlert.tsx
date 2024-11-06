import React, { ComponentProps } from "react";
import { Alert } from "@pagopa/io-app-design-system";
import { format } from "date-fns";
import * as O from "fp-ts/lib/Option";
import { sequenceT } from "fp-ts/lib/Apply";
import { constNull, pipe } from "fp-ts/lib/function";
import { StyleSheet, View } from "react-native";
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
  verticalSpacing?: boolean;
};

/**
 * This component renders an alert that displays information on the eID status.
 */
export const ItwEidLifecycleAlert = ({
  verticalSpacing = false,
  lifecycleStatus = defaultLifecycleStatus
}: Props) => {
  const eidOption = useIOSelector(itwCredentialsEidSelector);
  const maybeEidStatus = useIOSelector(itwCredentialsEidStatusSelector);

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
        variant: "warning",
        content: I18n.t(
          "features.itWallet.presentation.bottomSheets.eidInfo.alert.expiring",
          {
            date: format(eid.jwt.expiration, "DD-MM-YYYY")
          }
        )
      },
      jwtExpired: {
        variant: "error",
        content: I18n.t(
          "features.itWallet.presentation.bottomSheets.eidInfo.alert.expired"
        )
      }
    };

    return (
      <View style={verticalSpacing && styles.margins}>
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

const styles = StyleSheet.create({
  margins: {
    marginVertical: 16
  }
});
