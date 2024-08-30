import { ContentWrapper, Divider, VSpacer } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { ScrollView } from "react-native";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import { useScreenEndMargin } from "../../../../hooks/useScreenEndMargin";
import I18n from "../../../../i18n";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { ItwCredentialClaimsSection } from "../../common/components/ItwCredentialClaimsSection";
import { ItwReleaserName } from "../../common/components/ItwReleaserName";
import { parseClaims } from "../../common/utils/itwClaimsUtils";
import {
  ItWalletError,
  getItwGenericMappedError
} from "../../common/utils/itwErrorsUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { itwCredentialByTypeSelector } from "../../credentials/store/selectors";
import { ItwParamsList } from "../../navigation/ItwParamsList";
import { ItwPresentationAlertsSection } from "../components/ItwPresentationAlertsSection";
import { ItwPresentationDetailFooter } from "../components/ItwPresentationDetailFooter";
import { ItwPresentationDetailsHeader } from "../components/ItwPresentationDetailsHeader";

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
      () => <ErrorView />,
      credential => <ContentView credential={credential} />
    )
  );
};

/**
 * This component renders the entire credential detail.
 */
const ContentView = ({ credential }: { credential: StoredCredential }) => {
  const { screenEndMargin } = useScreenEndMargin();

  useDebugInfo({
    parsedCredential: credential.parsedCredential
  });

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: screenEndMargin }}>
      <ItwPresentationDetailsHeader credential={credential} />
      <ContentWrapper>
        <VSpacer size={16} />
        <ItwPresentationAlertsSection credential={credential} />
        <VSpacer size={16} />
        <ItwCredentialClaimsSection
          title={I18n.t(
            "features.itWallet.presentation.credentialDetails.documentDataTitle"
          )}
          claims={parseClaims(credential.parsedCredential, {
            exclude: ["unique_id"]
          })}
          canHideValues={true}
        />
        <Divider />
        <ItwReleaserName credential={credential} />
        <VSpacer size={24} />
        <ItwPresentationDetailFooter
          lastUpdateTime={today}
          issuerConf={credential.issuerConf}
        />
      </ContentWrapper>
    </ScrollView>
  );
};

/**
 * Error view component which currently displays a generic error.
 * @param error - optional ItWalletError to be displayed.
 */
const ErrorView = ({ error: _ }: { error?: ItWalletError }) => {
  const navigation = useIONavigation();
  const mappedError = getItwGenericMappedError(() => navigation.goBack());
  return <OperationResultScreenContent {...mappedError} />;
};
