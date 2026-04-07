import { ListItemAction } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { memo, ReactNode, useMemo } from "react";
import { View } from "react-native";

import { useOfflineToastGuard } from "../../../../../hooks/useOfflineToastGuard.ts";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { useFIMSRemoteServiceConfiguration } from "../../../../fims/common/hooks";
import { useNotAvailableToastGuard } from "../../../common/hooks/useNotAvailableToastGuard.ts";
import { itwIPatenteCtaConfigSelector } from "../../../common/store/selectors/remoteConfig.ts";
import { StoredCredential } from "../../../common/utils/itwTypesUtils.ts";
import { getCredentialDocumentNumber } from "../../../trustmark/utils";
import { useItwRemoveCredentialWithConfirm } from "../hooks/useItwRemoveCredentialWithConfirm";
import { useItwStartCredentialSupportRequest } from "../hooks/useItwStartCredentialSupportRequest.tsx";

type IPatenteListItemActionProps = {
  docNumber?: string;
};

type ItwPresentationDetailFooterProps = {
  credential: StoredCredential;
};

const ItwPresentationDetailsFooter = ({
  credential
}: ItwPresentationDetailFooterProps) => {
  const startAndTrackSupportRequest = useOfflineToastGuard(
    useItwStartCredentialSupportRequest(credential)
  );
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
        accessibilityLabel={I18n.t(
          "features.itWallet.presentation.credentialDetails.actions.requestAssistance"
        )}
        icon="message"
        label={I18n.t(
          "features.itWallet.presentation.credentialDetails.actions.requestAssistance"
        )}
        onPress={useNotAvailableToastGuard(startAndTrackSupportRequest)}
        testID="requestAssistanceActionTestID"
        variant="primary"
      />
      <ListItemAction
        accessibilityLabel={I18n.t(
          "features.itWallet.presentation.credentialDetails.actions.removeFromWallet"
        )}
        icon="trashcan"
        label={I18n.t(
          "features.itWallet.presentation.credentialDetails.actions.removeFromWallet"
        )}
        onPress={confirmAndRemoveCredential}
        testID="removeCredentialActionTestID"
        variant="danger"
      />
    </View>
  );
};

/**
 * Returns custom CTAs for a credential
 */
const getCredentialActions = (credential: StoredCredential): ReactNode => {
  const { credentialType, parsedCredential } = credential;
  const docNumber = getCredentialDocumentNumber(parsedCredential);

  return {
    mDL: [
      <IPatenteListItemAction docNumber={docNumber} key="iPatenteActionMdl" />
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
      icon="externalLink"
      label={label}
      onPress={startFimsAuthenticationFlow}
      testID="openIPatenteActionTestID"
      variant="primary"
    />
  );
};

const MemoizedItwPresentationDetailsFooter = memo(ItwPresentationDetailsFooter);

export { MemoizedItwPresentationDetailsFooter as ItwPresentationDetailsFooter };
