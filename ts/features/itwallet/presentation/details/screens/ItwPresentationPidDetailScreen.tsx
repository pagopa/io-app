import {
  Body,
  ContentWrapper,
  H2,
  Tag,
  VStack
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useCallback } from "react";
import { View } from "react-native";
import { useIOSelector } from "../../../../../store/hooks";
import { trackCredentialDetail } from "../analytics";
import { mapPIDStatusToMixpanel } from "../../../analytics/utils";
import { ItwCredentialDetailCard } from "../../../common/components/ItwCredentialDetailCard";
import { PoweredByItWalletText } from "../../../common/components/PoweredByItWalletText";
import {
  getCredentialNameFromType,
  tagPropsByStatus
} from "../../../common/utils/itwCredentialUtils";
import { useItwDisplayCredentialStatus } from "../hooks/useItwDisplayCredentialStatus";
import { getItwAuthSource } from "../../../common/utils/itwMetadataUtils";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";
import ItwAvatar from "../../../../../../img/features/itWallet/brand/itw_avatar.svg";
import { itwCredentialsCatalogueByTypesSelector } from "../../../credentialsCatalogue/store/selectors";
import {
  itwCredentialsEidSelector,
  itwCredentialsEidStatusSelector
} from "../../../credentials/store/selectors";
import { ItwPresentationDetailsScreenBase } from "../components/ItwPresentationDetailsScreenBase";
import { ItwPresentationPidDetail } from "../components/ItwPresentationPidDetail";
import { ItwPresentationPidDetailFooter } from "../components/ItwPresentationPidDetailFooter";

export const ItwPresentationPidDetailScreen = () => {
  const pidOption = useIOSelector(itwCredentialsEidSelector);
  const maybeEidStatus = useIOSelector(itwCredentialsEidStatusSelector);
  const credentialsCatalogue = useIOSelector(
    itwCredentialsCatalogueByTypesSelector
  );
  const displayStatus = useItwDisplayCredentialStatus(
    maybeEidStatus ?? "valid"
  );
  const statusTagProps = tagPropsByStatus[displayStatus];

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
    <ItwPresentationDetailsScreenBase credential={credential} headerTransparent>
      <ItwCredentialDetailCard credentialType={CredentialType.PID}>
        <ItwAvatar width={48} height={48} />
        <H2 style={{ paddingTop: 16 }}>
          {getCredentialNameFromType(CredentialType.PID, "", true)}
        </H2>
        <Body
          style={{ textAlign: "center", marginHorizontal: 32, paddingTop: 4 }}
        >
          {credentialsCatalogue?.[CredentialType.PID]
            ? getItwAuthSource(credentialsCatalogue[CredentialType.PID])
            : ""}
        </Body>
        {statusTagProps && (
          <View style={{ marginTop: 16 }}>
            <Tag forceLightMode {...statusTagProps} />
          </View>
        )}
      </ItwCredentialDetailCard>

      <ContentWrapper>
        <VStack style={{ paddingVertical: 16 }} space={16}>
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
