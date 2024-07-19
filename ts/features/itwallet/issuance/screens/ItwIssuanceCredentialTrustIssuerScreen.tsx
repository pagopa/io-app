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
import { StyleSheet, View } from "react-native";
import { FooterActions } from "../../../../components/ui/FooterActions";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import ItwMarkdown from "../../common/components/ItwMarkdown";
import { useItwDismissalDialog } from "../../common/hooks/useItwDismissalDialog";
import { parseClaims } from "../../common/utils/itwClaimsUtils";
import {
  CredentialType,
  itwCredentialNameByCredentialType
} from "../../common/utils/itwMocksUtils";
import {
  RequestObject,
  StoredCredential
} from "../../common/utils/itwTypesUtils";
import { itwCredentialsEidSelector } from "../../credentials/store/selectors";
import {
  selectCredentialType,
  selectIsLoading,
  selectRequestedCredential
} from "../../machine/credential/selectors";
import { ItwCredentialIssuanceMachineContext } from "../../machine/provider";
import {
  ItwRequestedClaimsList,
  RequiredClaim
} from "../components/ItwRequiredClaimsList";

const ItwIssuanceCredentialTrustIssuerScreen = () => {
  const eidOption = useIOSelector(itwCredentialsEidSelector);

  const maybeRequestedCredential =
    ItwCredentialIssuanceMachineContext.useSelector(selectRequestedCredential);
  const maybeCredentialType =
    ItwCredentialIssuanceMachineContext.useSelector(selectCredentialType);

  return pipe(
    sequenceS(O.Monad)({
      credentialType: O.fromNullable(maybeCredentialType),
      requestedCredential: O.fromNullable(maybeRequestedCredential),
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

const ContentView = ({ credentialType, eid }: ContentViewProps) => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();
  const isLoading =
    ItwCredentialIssuanceMachineContext.useSelector(selectIsLoading);

  const handleContinuePress = () => {
    machineRef.send({ type: "confirm-trust-data" });
  };

  const dimissDialog = useItwDismissalDialog(() =>
    machineRef.send({ type: "close" })
  );

  useHeaderSecondLevel({ title: "", goBack: dimissDialog.show });

  const claims = parseClaims(eid.parsedCredential);
  const requiredClaims = claims.map(
    a =>
      ({
        name: a.label,
        source:
          itwCredentialNameByCredentialType[
            eid.credentialType as CredentialType
          ]
      } as RequiredClaim)
  );

  return (
    <ForceScrollDownView>
      <ContentWrapper>
        <VSpacer size={24} />
        <View style={styles.header}>
          <Avatar
            size="small"
            logoUri={require("../../../../../img/features/itWallet/issuer/ipzs.png")}
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
            credentialName: itwCredentialNameByCredentialType[credentialType]
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
        <ItwRequestedClaimsList claims={requiredClaims} />
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
            onPress: dimissDialog.show
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
