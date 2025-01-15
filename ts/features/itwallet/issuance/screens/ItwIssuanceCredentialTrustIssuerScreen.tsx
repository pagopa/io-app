import {
  Avatar,
  ContentWrapper,
  FeatureInfo,
  ForceScrollDownView,
  H2,
  HSpacer,
  Icon,
  ListItemHeader,
  VSpacer
} from "@pagopa/io-app-design-system";
import { sequenceS } from "fp-ts/lib/Apply";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { FooterActions } from "../../../../components/ui/FooterActions";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { ItwGenericErrorContent } from "../../common/components/ItwGenericErrorContent";
import ItwMarkdown from "../../common/components/ItwMarkdown";
import { useItwDisableGestureNavigation } from "../../common/hooks/useItwDisableGestureNavigation";
import { useItwDismissalDialog } from "../../common/hooks/useItwDismissalDialog";
import { parseClaims, WellKnownClaim } from "../../common/utils/itwClaimsUtils";
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
import {
  ItwRequestedClaimsList,
  RequiredClaim
} from "../components/ItwRequiredClaimsList";
import {
  CREDENTIALS_MAP,
  trackIssuanceCredentialScrollToBottom,
  trackItwExit,
  trackOpenItwTos,
  trackWalletDataShare,
  trackWalletDataShareAccepted
} from "../../analytics";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import { usePreventScreenCapture } from "../../../../utils/hooks/usePreventScreenCapture";
import { itwIpzsPrivacyUrl } from "../../../../config";
import { ITW_ROUTES } from "../../navigation/routes";

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

  useFocusEffect(
    useCallback(() => {
      trackWalletDataShare(CREDENTIALS_MAP[credentialType]);
    }, [credentialType])
  );

  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const isIssuing =
    ItwCredentialIssuanceMachineContext.useSelector(selectIsIssuing);

  const handleContinuePress = () => {
    machineRef.send({ type: "confirm-trust-data" });
    trackWalletDataShareAccepted(CREDENTIALS_MAP[credentialType]);
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
  const requiredClaims = claims.map(
    claim =>
      ({
        claim,
        source: getCredentialNameFromType(eid.credentialType)
      } as RequiredClaim)
  );

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
        <View style={styles.header}>
          <Avatar
            size="small"
            logoUri={require("../../../../../img/features/itWallet/issuer/IPZS.png")}
          />
          <HSpacer size={8} />
          <Icon name={"transactions"} color={"grey-450"} size={24} />
          <HSpacer size={8} />
          <Avatar
            size="small"
            logoUri={require("../../../../../img/app/app-logo-inverted.png")}
          />
        </View>
        <VSpacer size={24} />
        <H2>
          {I18n.t("features.itWallet.issuance.credentialAuth.title", {
            credentialName: getCredentialNameFromType(credentialType)
          })}
        </H2>
        <ItwMarkdown>
          {I18n.t("features.itWallet.issuance.credentialAuth.subtitle", {
            organization: ISSUER_MOCK_NAME
          })}
        </ItwMarkdown>
        <VSpacer size={8} />
        <ListItemHeader
          label={I18n.t(
            "features.itWallet.issuance.credentialAuth.requiredClaims"
          )}
          iconName="security"
          iconColor="grey-700"
        />
        <ItwRequestedClaimsList items={requiredClaims} />
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
        <ItwMarkdown
          styles={{ body: { fontSize: 14 } }}
          onLinkOpen={trackOpenItwTos}
        >
          {I18n.t("features.itWallet.issuance.credentialAuth.tos", {
            privacyUrl: itwIpzsPrivacyUrl
          })}
        </ItwMarkdown>
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

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center"
  }
});

export { ItwIssuanceCredentialTrustIssuerScreen };
