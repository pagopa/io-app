import { ListItemAction } from "@io-app/design-system";
import I18n from "i18next";
import { memo, ReactNode, useMemo } from "react";
import { View } from "react-native";

import { useOfflineToastGuard } from "../../../../../hooks/useOfflineToastGuard.ts";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { useFIMSRemoteServiceConfiguration } from "../../../../fims/common/hooks";
import { getMixPanelCredential } from "../../../analytics/utils";
import { useNotAvailableToastGuard } from "../../../common/hooks/useNotAvailableToastGuard.ts";
import { itwIPatenteCtaConfigSelector } from "../../../common/store/selectors/remoteConfig.ts";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils.ts";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../../navigation/routes.ts";
import { getCredentialDocumentNumber } from "../../../trustmark/utils";
import { trackItwCredentialManageConsent } from "../../proximity/analytics";
import { itwProximityShouldShowConsentManagementSelector } from "../../proximity/store/selectors/consents";
import { useItwRemoveCredentialWithConfirm } from "../hooks/useItwRemoveCredentialWithConfirm";
import { useItwStartCredentialSupportRequest } from "../hooks/useItwStartCredentialSupportRequest.tsx";

type IPatenteListItemActionProps = {
  docNumber?: string;
};

type ItwPresentationDetailFooterProps = {
  credential: CredentialMetadata;
};

const ItwPresentationDetailsFooter = ({
  credential
}: ItwPresentationDetailFooterProps) => {
  const navigation = useIONavigation();
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const consentManagementSelector = useMemo(
    () =>
      itwProximityShouldShowConsentManagementSelector(
        credential.credentialType
      ),
    [credential.credentialType]
  );
  const showConsentManagement = useIOSelector(consentManagementSelector);
  const startAndTrackSupportRequest = useOfflineToastGuard(
    useItwStartCredentialSupportRequest(credential)
  );
  const handleSupportRequest = useNotAvailableToastGuard(
    startAndTrackSupportRequest
  );
  const { confirmAndRemoveCredential } = useItwRemoveCredentialWithConfirm(
    credential,
    "screen"
  );
  const credentialActions = useMemo(
    () => getCredentialActions(credential),
    [credential]
  );

  return (
    <View>
      {credentialActions}
      {showConsentManagement && (
        <ListItemAction
          accessibilityLabel={I18n.t(
            "features.itWallet.presentation.proximity.consentManagement.cta"
          )}
          icon="key"
          label={I18n.t(
            "features.itWallet.presentation.proximity.consentManagement.cta"
          )}
          onPress={() => {
            trackItwCredentialManageConsent({
              credential: getMixPanelCredential(
                credential.credentialType,
                isItwL3
              )
            });
            navigation.navigate(ITW_ROUTES.MAIN, {
              screen: ITW_ROUTES.PRESENTATION.CONSENT_MANAGEMENT,
              params: { credentialType: credential.credentialType }
            });
          }}
          testID="manageConsentsActionTestID"
          variant="primary"
        />
      )}
      {!isItwL3 && (
        <ListItemAction
          accessibilityLabel={I18n.t(
            "features.itWallet.presentation.credentialDetails.actions.requestAssistance"
          )}
          icon="message"
          label={I18n.t(
            "features.itWallet.presentation.credentialDetails.actions.requestAssistance"
          )}
          onPress={handleSupportRequest}
          testID="requestAssistanceActionTestID"
          variant="primary"
        />
      )}
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
const getCredentialActions = (credential: CredentialMetadata): ReactNode => {
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
