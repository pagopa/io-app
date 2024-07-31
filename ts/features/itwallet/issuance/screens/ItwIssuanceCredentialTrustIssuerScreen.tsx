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
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { ImageURISource, StyleSheet, View } from "react-native";
import { FooterActions } from "../../../../components/ui/FooterActions";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import ItwMarkdown from "../../common/components/ItwMarkdown";
import { useItwDisbleGestureNavigation } from "../../common/hooks/useItwDisbleGestureNavigation";
import { useItwDismissalDialog } from "../../common/hooks/useItwDismissalDialog";
import { parseClaims } from "../../common/utils/itwClaimsUtils";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import {
  RequestObject,
  StoredCredential
} from "../../common/utils/itwTypesUtils";
import { itwCredentialsEidSelector } from "../../credentials/store/selectors";
import {
  selectCredentialTypeOption,
  selectIsLoading,
  selectIssuerConfigurationOption,
  selectRequestedCredentialOption
} from "../../machine/credential/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../machine/provider";
import {
  ItwRequestedClaimsList,
  RequiredClaim
} from "../components/ItwRequiredClaimsList";

const ItwIssuanceCredentialTrustIssuerScreen = () => {
  const eidOption = useIOSelector(itwCredentialsEidSelector);
  const requestedCredentialOption =
    ItwCredentialIssuanceMachineContext.useSelector(
      selectRequestedCredentialOption
    );
  const credentialTypeOption = ItwCredentialIssuanceMachineContext.useSelector(
    selectCredentialTypeOption
  );

  return pipe(
    sequenceS(O.Monad)({
      credentialType: credentialTypeOption,
      requestedCredential: requestedCredentialOption,
      eid: eidOption
    }),
    O.fold(constNull, props => <ContentView {...props} />)
  );
};

type ContentViewProps = {
  credentialType: CredentialType;
  requestedCredential: RequestObject;
  eid: StoredCredential;
};

/**
 * Renders the content of the screen
 */
const ContentView = ({ credentialType, eid }: ContentViewProps) => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const isLoading =
    ItwCredentialIssuanceMachineContext.useSelector(selectIsLoading);
  const issuerConfOption = ItwCredentialIssuanceMachineContext.useSelector(
    selectIssuerConfigurationOption
  );

  const handleContinuePress = () => {
    machineRef.send({ type: "confirm-trust-data" });
  };

  const dismissDialog = useItwDismissalDialog(() =>
    machineRef.send({ type: "close" })
  );

  useItwDisbleGestureNavigation();
  useAvoidHardwareBackButton();

  useHeaderSecondLevel({ title: "", goBack: dismissDialog.show });

  useDebugInfo({
    issuerConfOption,
    parsedCredential: eid.parsedCredential
  });

  const claims = parseClaims(eid.parsedCredential, { exclude: ["unique_id"] });
  const requiredClaims = claims.map(
    claim =>
      ({
        claim,
        source: getCredentialNameFromType(eid.credentialType)
      } as RequiredClaim)
  );

  const issuerLogoUri = pipe(
    issuerConfOption,
    O.map(
      config => ({ uri: config.federation_entity.logo_uri } as ImageURISource)
    ),
    O.toUndefined
  );

  return (
    <ForceScrollDownView>
      <ContentWrapper>
        <VSpacer size={24} />
        <View style={styles.header}>
          <Avatar size="small" logoUri={issuerLogoUri} />
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
            organization: "Istituto Poligrafico e Zecca"
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
        <ItwMarkdown styles={{ body: { fontSize: 14 } }}>
          {I18n.t("features.itWallet.issuance.credentialAuth.tos")}
        </ItwMarkdown>
      </ContentWrapper>
      <FooterActions
        fixed={false}
        actions={{
          type: "TwoButtons",
          primary: {
            label: I18n.t("global.buttons.continue"),
            onPress: handleContinuePress,
            loading: isLoading
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
