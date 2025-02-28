import {
  ContentWrapper,
  FeatureInfo,
  FooterActions,
  ForceScrollDownView,
  H2,
  ListItemHeader,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useRoute } from "@react-navigation/native";
import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import IOMarkdown from "../../../../components/IOMarkdown";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { generateDynamicUrlSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { ITW_IPZS_PRIVACY_URL_BODY } from "../../../../urls";
import { usePreventScreenCapture } from "../../../../utils/hooks/usePreventScreenCapture";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import {
  CREDENTIALS_MAP,
  trackIssuanceCredentialScrollToBottom,
  trackItwExit,
  trackOpenItwTos
} from "../../analytics";
import { ItwGenericErrorContent } from "../../common/components/ItwGenericErrorContent";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { useItwDismissalDialog } from "../../common/hooks/useItwDismissalDialog";
import { WellKnownClaim, parseClaims } from "../../common/utils/itwClaimsUtils";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import { ISSUER_MOCK_NAME } from "../../common/utils/itwMocksUtils";
import {
  RequestObject,
  StoredCredential
} from "../../common/utils/itwTypesUtils";
import { itwCredentialsEidSelector } from "../../credentials/store/selectors";
import {
  selectCredentialTypeOption,
  selectIsIssuing,
  selectIsLoading,
  selectRequestedCredentialOption
} from "../../machine/credential/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../machine/provider";
import { ITW_ROUTES } from "../../navigation/routes";
import { generateLinkRuleWithCallback } from "../../common/utils/markdown";
import { ItwDataExchangeIcons } from "../../common/components/ItwDataExchangeIcons";
import { ItwRequiredClaimsList } from "../../common/components/ItwClaimsDisclosure";

const ItwIssuanceCredentialTrustIssuerScreen = () => {
  const eidOption = useIOSelector(itwCredentialsEidSelector);
  const isLoading =
    ItwCredentialIssuanceMachineContext.useSelector(selectIsLoading);
  const requestedCredentialOption =
    ItwCredentialIssuanceMachineContext.useSelector(
      selectRequestedCredentialOption
    );
  const credentialTypeOption = ItwCredentialIssuanceMachineContext.useSelector(
    selectCredentialTypeOption
  );

  usePreventScreenCapture();
  useItwDisableGestureNavigation();
  useAvoidHardwareBackButton();

  if (isLoading) {
    return (
      <LoadingScreenContent contentTitle={I18n.t("global.genericWaiting")} />
    );
  }

  return pipe(
    sequenceS(O.Monad)({
      credentialType: credentialTypeOption,
      requestedCredential: requestedCredentialOption,
      eid: eidOption
    }),
    O.fold(
      () => <ItwGenericErrorContent />,
      props => <ContentView {...props} />
    )
  );
};

type ContentViewProps = {
  credentialType: string;
  requestedCredential: RequestObject;
  eid: StoredCredential;
};

/**
 * Renders the content of the screen
 */
const ContentView = ({ credentialType, eid }: ContentViewProps) => {
  const route = useRoute();
  const privacyUrl = useIOSelector(state =>
    generateDynamicUrlSelector(state, "io_showcase", ITW_IPZS_PRIVACY_URL_BODY)
  );

  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const isIssuing =
    ItwCredentialIssuanceMachineContext.useSelector(selectIsIssuing);

  const handleContinuePress = () => {
    machineRef.send({ type: "confirm-trust-data" });
  };

  const dismissDialog = useItwDismissalDialog(() => {
    machineRef.send({ type: "close" });
    trackItwExit({
      exit_page: route.name,
      credential: CREDENTIALS_MAP[credentialType]
    });
  });

  useHeaderSecondLevel({ title: "", goBack: dismissDialog.show });

  useDebugInfo({
    parsedCredential: eid.parsedCredential
  });

  const claims = parseClaims(eid.parsedCredential, {
    exclude: [WellKnownClaim.unique_id, WellKnownClaim.link_qr_code]
  });
  const requiredClaims = claims.map(claim => ({
    claim,
    source: getCredentialNameFromType(eid.credentialType)
  }));

  const trackScrollToBottom = (crossed: boolean) => {
    if (crossed) {
      trackIssuanceCredentialScrollToBottom(
        CREDENTIALS_MAP[credentialType],
        ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER
      );
    }
  };

  return (
    <ForceScrollDownView onThresholdCrossed={trackScrollToBottom}>
      <ContentWrapper>
        <VSpacer size={24} />
        <ItwDataExchangeIcons
          requesterLogoUri={require("../../../../../img/features/itWallet/issuer/IPZS.png")}
        />
        <VSpacer size={24} />
        <H2>
          {I18n.t("features.itWallet.issuance.credentialAuth.title", {
            credentialName: getCredentialNameFromType(credentialType)
          })}
        </H2>
        <IOMarkdown
          content={I18n.t(
            "features.itWallet.issuance.credentialAuth.subtitle",
            {
              organization: ISSUER_MOCK_NAME
            }
          )}
        />
        <VSpacer size={8} />
        <ListItemHeader
          label={I18n.t(
            "features.itWallet.issuance.credentialAuth.requiredClaims"
          )}
          iconName="security"
          iconColor="grey-700"
        />
        <ItwRequiredClaimsList items={requiredClaims} />
        <VSpacer size={24} />
        <FeatureInfo
          iconName="fornitori"
          body={I18n.t(
            "features.itWallet.issuance.credentialAuth.disclaimer.0"
          )}
        />
        <VSpacer size={24} />
        <FeatureInfo
          iconName="trashcan"
          body={I18n.t(
            "features.itWallet.issuance.credentialAuth.disclaimer.1"
          )}
        />
        <VSpacer size={32} />
        <IOMarkdown
          content={I18n.t("features.itWallet.issuance.credentialAuth.tos", {
            privacyUrl
          })}
          rules={generateLinkRuleWithCallback(trackOpenItwTos)}
        />
      </ContentWrapper>
      <FooterActions
        fixed={false}
        actions={{
          type: "TwoButtons",
          primary: {
            label: I18n.t("global.buttons.continue"),
            onPress: handleContinuePress,
            loading: isIssuing
          },
          secondary: {
            label: I18n.t("global.buttons.cancel"),
            onPress: dismissDialog.show
          }
        }}
      />
    </ForceScrollDownView>
  );
};

export { ItwIssuanceCredentialTrustIssuerScreen };
