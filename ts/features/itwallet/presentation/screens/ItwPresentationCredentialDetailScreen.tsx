import { ContentWrapper, VSpacer } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { ItwCredentialClaimsList } from "../../common/components/ItwCredentialClaimList";
import { ItwGenericErrorContent } from "../../common/components/ItwGenericErrorContent";
import { getHumanReadableParsedCredential } from "../../common/utils/debug";
import { itwCredentialByTypeSelector } from "../../credentials/store/selectors";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ItwPresentationAlertsSection } from "../components/ItwPresentationAlertsSection";
import { ItwPresentationDetailsFooter } from "../components/ItwPresentationDetailsFooter";
import { ItwPresentationDetailsHeader } from "../components/ItwPresentationDetailsHeader";
import { ItwPresentationDetailsScreenBase } from "../components/ItwPresentationDetailsScreenBase";
import { ItwQrCodeClaimImage } from "../../common/components/ItwQrCodeClaimImage";

export type ItwPresentationCredentialDetailNavigationParams = {
  credentialType: string;
};

type Props = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_PRESENTATION_CREDENTIAL_DETAIL"
>;

export const ItwPresentationCredentialDetailScreen = ({ route }: Props) => {
  const { credentialType } = route.params;
  const credentialOption = useIOSelector(
    itwCredentialByTypeSelector(credentialType)
  );

  useDebugInfo({
    parsedCredential: pipe(
      credentialOption,
      O.map(credential =>
        getHumanReadableParsedCredential(credential.parsedCredential)
      ),
      O.toUndefined
    )
  });

  if (O.isNone(credentialOption)) {
    // This is unlikely to happen, but we want to handle the case where the credential is not found
    // because of inconsistencies in the state, and assert that the credential is O.some
    return <ItwGenericErrorContent />;
  }

  const credential = credentialOption.value;

  return (
    <ItwPresentationDetailsScreenBase credential={credential}>
      <ItwPresentationDetailsHeader credential={credential} />
      <VSpacer size={16} />
      <ContentWrapper>
        <ItwPresentationAlertsSection credential={credential} />
        <VSpacer size={16} />
        <ItwCredentialClaimsList
          data={credential}
          customClaimsSlot={
            <ItwQrCodeClaimImage
              claim={credential.parsedCredential.link_qr_code}
            />
          }
        />
      </ContentWrapper>
      <VSpacer size={24} />
      <ItwPresentationDetailsFooter credential={credential} />
    </ItwPresentationDetailsScreenBase>
  );
};
