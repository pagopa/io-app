import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { VSpacer } from "@pagopa/io-app-design-system";
import { ItwPresentationPidDetail } from "../components/ItwPresentationPidDetail";
import { useIOSelector } from "../../../../../store/hooks";
import {
  itwCredentialsEidSelector,
  itwCredentialsEidStatusSelector
} from "../../../credentials/store/selectors";
import { ItwPresentationPidScaffoldScreen } from "../components/ItwPresentationPidScaffoldScreen";
import { ItwPresentationPidDetailFooter } from "../components/ItwPresentationPidDetailFooter";
import {
  mapPIDStatusToMixpanel,
  trackCredentialDetail
} from "../../../analytics";

export const ItwPresentationPidDetailScreen = () => {
  const pidOption = useIOSelector(itwCredentialsEidSelector);
  const maybeEidStatus = useIOSelector(itwCredentialsEidStatusSelector);

  useFocusEffect(
    useCallback(() => {
      if (maybeEidStatus) {
        trackCredentialDetail({
          credential: "ITW_PID",
          credential_status: mapPIDStatusToMixpanel(maybeEidStatus)
        });
      }
    }, [maybeEidStatus])
  );

  return pipe(
    pidOption,
    O.fold(
      constNull, // This should never happen
      credential => (
        <ItwPresentationPidScaffoldScreen credential={credential}>
          <ItwPresentationPidDetail credential={credential} />
          <VSpacer />
          <ItwPresentationPidDetailFooter credential={credential} />
        </ItwPresentationPidScaffoldScreen>
      )
    )
  );
};
