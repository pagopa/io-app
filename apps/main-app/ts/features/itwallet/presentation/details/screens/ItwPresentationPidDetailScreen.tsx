import { ContentWrapper, VStack } from "@io-app/design-system";
import { useFocusEffect } from "@react-navigation/native";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useCallback } from "react";
import { View } from "react-native";
import { useIOSelector } from "../../../../../store/hooks";
import { trackCredentialDetail } from "../analytics";
import { mapPIDStatusToMixpanel } from "../../../analytics/utils";
import { PoweredByItWalletText } from "../../../common/components/PoweredByItWalletText";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils";
import {
  itwCredentialsEidSelector,
  itwCredentialsEidStatusSelector
} from "../../../credentials/store/selectors";
import { ItwPresentationDetailsHeader } from "../components/ItwPresentationDetailsHeader";
import { ItwPresentationDetailsScreenBase } from "../components/ItwPresentationDetailsScreenBase";
import { ItwPresentationPidDetail } from "../components/ItwPresentationPidDetail";
import { ItwPresentationPidDetailFooter } from "../components/ItwPresentationPidDetailFooter";
import { ItwDiscoveryInfoBanner } from "../components/ItwDiscoveryInfoBanner";
import { itwIsBannerHiddenSelector } from "../../../common/store/selectors/banners";

export const ItwPresentationPidDetailScreen = () => {
  const pidOption = useIOSelector(itwCredentialsEidSelector);
  const maybeEidStatus = useIOSelector(itwCredentialsEidStatusSelector);

  const isItwDiscoveryInfoBannerHidden = useIOSelector(
    itwIsBannerHiddenSelector("itw_pid_info")
  );

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

  const getContent = (credential: CredentialMetadata) => (
    <ItwPresentationDetailsScreenBase credential={credential} headerTransparent>
      <ItwPresentationDetailsHeader credential={credential} />
      <ContentWrapper>
        <VStack style={{ paddingVertical: 16 }} space={24}>
          {!isItwDiscoveryInfoBannerHidden && <ItwDiscoveryInfoBanner />}
          <ItwPresentationPidDetail credential={credential} />
          <ItwPresentationPidDetailFooter credential={credential} />
          <View style={{ alignItems: "center" }}>
            <PoweredByItWalletText />
          </View>
        </VStack>
      </ContentWrapper>
    </ItwPresentationDetailsScreenBase>
  );

  return pipe(pidOption, O.fold(constNull, getContent));
};
