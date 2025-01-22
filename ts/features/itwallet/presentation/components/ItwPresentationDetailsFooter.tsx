import { ListItemAction, useIOToast } from "@pagopa/io-app-design-system";
import { memo, ReactNode, useMemo } from "react";
import { Alert, View } from "react-native";
import { useStartSupportRequest } from "../../../../hooks/useStartSupportRequest";
import I18n from "../../../../i18n";
import NavigationService from "../../../../navigation/NavigationService";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
import { FIMS_ROUTES } from "../../../fims/common/navigation";
import {
  CREDENTIALS_MAP,
  trackCredentialDeleteProperties,
  trackItwCredentialDelete,
  trackWalletCredentialSupport
} from "../../analytics";
import { itwIPatenteCtaConfigSelector } from "../../common/store/selectors/remoteConfig";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { itwCredentialsRemove } from "../../credentials/store/actions";
import { trackAuthenticationStart } from "../../../fims/common/analytics";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";

type ItwPresentationDetailFooterProps = {
  credential: StoredCredential;
};

const ItwPresentationDetailsFooter = ({
  credential
}: ItwPresentationDetailFooterProps) => {
  const dispatch = useIODispatch();
  const store = useIOStore();

  const navigation = useIONavigation();
  const toast = useIOToast();

  const startSupportRequest = useStartSupportRequest({
    faqCategories: []
  });

  const handleRemoveCredential = () => {
    dispatch(itwCredentialsRemove(credential));
    toast.success(
      I18n.t("features.itWallet.presentation.credentialDetails.toast.removed")
    );
    void trackCredentialDeleteProperties(
      CREDENTIALS_MAP[credential.credentialType],
      store.getState()
    );

    navigation.pop();
  };

  const showRemoveCredentialDialog = () => {
    trackItwCredentialDelete(CREDENTIALS_MAP[credential.credentialType]);
    return Alert.alert(
      I18n.t(
        "features.itWallet.presentation.credentialDetails.dialogs.remove.title"
      ),
      I18n.t(
        "features.itWallet.presentation.credentialDetails.dialogs.remove.content"
      ),
      [
        {
          text: I18n.t(
            "features.itWallet.presentation.credentialDetails.dialogs.remove.confirm"
          ),
          style: "destructive",
          onPress: handleRemoveCredential
        },
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        }
      ]
    );
  };

  const startAndTrackSupportRequest = () => {
    trackWalletCredentialSupport(CREDENTIALS_MAP[credential.credentialType]);
    startSupportRequest();
  };

  const credentialActions = useMemo(
    () => getCredentialActions(credential.credentialType),
    [credential.credentialType]
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
        onPress={startAndTrackSupportRequest}
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
        onPress={showRemoveCredentialDialog}
      />
    </View>
  );
};

/**
 * Returns custom CTAs for a credential
 */
const getCredentialActions = (credentialType: string): ReactNode =>
  ({
    MDL: [<IPatenteListItemAction key="iPatenteActionMdl" />],
    EuropeanHealthInsuranceCard: [],
    EuropeanDisabilityCard: []
  }[credentialType]);

/**
 * Renders the IPatente service action item
 */
const IPatenteListItemAction = () => {
  const ctaConfig = useIOSelector(itwIPatenteCtaConfigSelector);

  if (!ctaConfig?.visibility) {
    return null;
  }

  const label = I18n.t(
    "features.itWallet.presentation.credentialDetails.actions.openIPatente"
  );

  const trackIPatenteAuthenticationStart = (label: string) =>
    trackAuthenticationStart(
      ctaConfig.service_id as ServiceId,
      ctaConfig.service_name,
      ctaConfig.service_organization_name,
      ctaConfig.service_organization_fiscal_code,
      label,
      "credential_detail"
    );

  return (
    <ListItemAction
      testID="openIPatenteActionTestID"
      variant="primary"
      icon="externalLink"
      label={label}
      onPress={() => {
        trackIPatenteAuthenticationStart(label);
        NavigationService.navigate(FIMS_ROUTES.MAIN, {
          screen: FIMS_ROUTES.CONSENTS,
          params: {
            ctaText: label,
            ctaUrl: ctaConfig.url
          }
        });
      }}
    />
  );
};

const MemoizedItwPresentationDetailsFooter = memo(ItwPresentationDetailsFooter);

export { MemoizedItwPresentationDetailsFooter as ItwPresentationDetailsFooter };
