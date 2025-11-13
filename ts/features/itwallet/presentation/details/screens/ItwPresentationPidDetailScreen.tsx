import { ContentWrapper, VSpacer } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useCallback } from "react";
import { useIOSelector } from "../../../../../store/hooks";
import {
  mapPIDStatusToMixpanel,
  trackCredentialDetail
} from "../../../analytics";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";
import {
  itwCredentialsEidSelector,
  itwCredentialsEidStatusSelector
} from "../../../credentials/store/selectors";
import { ItwPresentationDetailsScreenBase } from "../components/ItwPresentationDetailsScreenBase";
import { ItwPresentationPidDetail } from "../components/ItwPresentationPidDetail";
import { ItwPresentationPidDetailFooter } from "../components/ItwPresentationPidDetailFooter";
import { ItwPresentationPidDetailHeader } from "../components/ItwPresentationPidDetailHeader";

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

  const getContent = (credential: StoredCredential) => (
    <ItwPresentationDetailsScreenBase credential={credential}>
      <ItwPresentationPidDetailHeader />
      {/** TODO: [SIW-3307] Add IT-Wallet gradient line  */}
      <ContentWrapper>
        <VSpacer size={16} />
        <ItwPresentationPidDetail credential={credential} />
        <VSpacer size={16} />
        <ItwPresentationPidDetailFooter credential={credential} />
      </ContentWrapper>
    </ItwPresentationDetailsScreenBase>
  );

  return pipe(pidOption, O.fold(constNull, getContent));
};
