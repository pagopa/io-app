import { ListItemAction } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { memo, ReactNode, useMemo } from "react";
import { View } from "react-native";
import { useOfflineToastGuard } from "../../../../../hooks/useOfflineToastGuard.ts";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { useFIMSRemoteServiceConfiguration } from "../../../../fims/common/hooks";
import { useNotAvailableToastGuard } from "../../../common/hooks/useNotAvailableToastGuard.ts";
import { itwIPatenteCtaConfigSelector } from "../../../common/store/selectors/remoteConfig.ts";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils.ts";
import { getCredentialDocumentNumber } from "../../../trustmark/utils";
import { useItwRemoveCredentialWithConfirm } from "../hooks/useItwRemoveCredentialWithConfirm";
import { useItwStartCredentialSupportRequest } from "../hooks/useItwStartCredentialSupportRequest.tsx";

type ItwPresentationDetailFooterProps = {
  credential: CredentialMetadata;
};

type IPatenteListItemActionProps = {
  docNumber?: string;
};

const ItwPresentationDetailsFooter = ({
  credential
}: ItwPresentationDetailFooterProps) => {
  const startAndTrackSupportRequest =
    useItwStartCredentialSupportRequest(credential);
  const { confirmAndRemoveCredential } =
    useItwRemoveCredentialWithConfirm(credential);
  const credentialActions = useMemo(
    () => getCredentialActions(credential),
    [credential]
  );

  return (
    <View>
      {credentialActions}
      <ListItemAction
        testID="requestAssistanceActionTestID"
        variant="primary"
        icon="message"
        label={I18n.t(
          "features.itWallet.presentation.credentialDetails.actions.requestAssistance"
        )}
        accessibilityLabel={I18n.t(
          "features.itWallet.presentation.credentialDetails.actions.requestAssistance"
        )}
        onPress={useNotAvailableToastGuard(startAndTrackSupportRequest)}
      />
      <ListItemAction
        testID="removeCredentialActionTestID"
        variant="danger"
        icon="trashcan"
        label={I18n.t(
          "features.itWallet.presentation.credentialDetails.actions.removeFromWallet"
        )}
        accessibilityLabel={I18n.t(
          "features.itWallet.presentation.credentialDetails.actions.removeFromWallet"
        )}
        onPress={confirmAndRemoveCredential}
      />
    </View>
  );
};

/**
 * Returns custom CTAs for a credential
 */
const getCredentialActions = (credential: CredentialMetadata): ReactNode => {
  const { credentialType, parsedCredential } = credential;
  const docNumber = getCredentialDocumentNumber(parsedCredential);

  return {
    mDL: [
      <IPatenteListItemAction key="iPatenteActionMdl" docNumber={docNumber} />
    ],
    EuropeanHealthInsuranceCard: [],
    EuropeanDisabilityCard: []
  }[credentialType];
};

/**
 * Renders the IPatente service action item
 */
const IPatenteListItemAction = ({ docNumber }: IPatenteListItemActionProps) => {
  const { startFIMSAuthenticationFlow } =
    useFIMSRemoteServiceConfiguration("iPatente");
  const ctaConfig = useIOSelector(itwIPatenteCtaConfigSelector);
  const startFimsAuthenticationFlow = useOfflineToastGuard(() =>
    startFIMSAuthenticationFlow(label, iPatenteUrl)
  );

  if (!ctaConfig?.visibility) {
    return null;
  }

  const label = I18n.t(
    "features.itWallet.presentation.credentialDetails.actions.openIPatente"
  );

  const iPatenteUrl = docNumber
    ? `${ctaConfig.url}/${docNumber}`
    : ctaConfig.url;

  return (
    <ListItemAction
      testID="openIPatenteActionTestID"
      variant="primary"
      icon="externalLink"
      label={label}
      onPress={startFimsAuthenticationFlow}
    />
  );
};

const MemoizedItwPresentationDetailsFooter = memo(ItwPresentationDetailsFooter);

export { MemoizedItwPresentationDetailsFooter as ItwPresentationDetailsFooter };
