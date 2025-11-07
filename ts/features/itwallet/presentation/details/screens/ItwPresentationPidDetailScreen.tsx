import { VSpacer } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useCallback } from "react";
import { useIOSelector } from "../../../../../store/hooks";
import {
  mapPIDStatusToMixpanel,
  trackCredentialDetail
} from "../../../analytics";
import {
  itwCredentialsEidSelector,
  itwCredentialsEidStatusSelector
} from "../../../credentials/store/selectors";
import { ItwPresentationPidDetail } from "../components/ItwPresentationPidDetail";
import { ItwPresentationPidDetailFooter } from "../components/ItwPresentationPidDetailFooter";
import { ItwPresentationPidScaffoldScreen } from "../components/ItwPresentationPidScaffoldScreen";

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
          <VSpacer size={16} />
          <ItwPresentationPidDetail credential={credential} />
          <VSpacer size={16} />
          <ItwPresentationPidDetailFooter credential={credential} />
        </ItwPresentationPidScaffoldScreen>
      )
    )
  );
};
