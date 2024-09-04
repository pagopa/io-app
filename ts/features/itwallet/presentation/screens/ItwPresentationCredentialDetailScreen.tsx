import { ContentWrapper, VSpacer } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import I18n from "../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { ItwGenericErrorContent } from "../../common/components/ItwGenericErrorContent";
import { getHumanReadableParsedCredential } from "../../common/utils/debug";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { itwCredentialByTypeSelector } from "../../credentials/store/selectors";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ItwPresentationAlertsSection } from "../components/ItwPresentationAlertsSection";
import { ItwPresentationClaimsSection } from "../components/ItwPresentationClaimsSection";
import { ItwPresentationDetailsFooter } from "../components/ItwPresentationDetailsFooter";
import { ItwPresentationDetailsHeader } from "../components/ItwPresentationDetailsHeader";
import { ItwPresentationDetailsScreenBase } from "../components/ItwPresentationDetailsScreenBase";

// TODO: use the real credential update time
const today = new Date();

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

  return pipe(
    credentialOption,
    O.fold(
      () => <ItwGenericErrorContent />,
      credential => <ContentView credential={credential} />
    )
  );
};

type ContentViewProps = {
  credential: StoredCredential;
};

/**
 * This component renders the entire credential detail.
 */
const ContentView = ({ credential }: ContentViewProps) => {
  useDebugInfo({
    parsedCredential: getHumanReadableParsedCredential(
      credential.parsedCredential
    )
  });

  return (
    <ItwPresentationDetailsScreenBase credential={credential}>
      <ItwPresentationDetailsHeader credential={credential} />
      <VSpacer size={16} />
      <ContentWrapper>
        <ItwPresentationAlertsSection credential={credential} />
        <VSpacer size={16} />
        <ItwPresentationClaimsSection
          title={I18n.t(
            "features.itWallet.presentation.credentialDetails.documentDataTitle"
          )}
          data={credential}
          canHideValues={true}
        />
      </ContentWrapper>
      <VSpacer size={24} />
      <ItwPresentationDetailsFooter
        lastUpdateTime={today}
        issuerConf={credential.issuerConf}
      />
    </ItwPresentationDetailsScreenBase>
  );
};
