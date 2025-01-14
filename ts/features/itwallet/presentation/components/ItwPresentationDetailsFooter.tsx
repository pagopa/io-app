import { ListItemAction, useIOToast } from "@pagopa/io-app-design-system";
import React, { useMemo } from "react";
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
import { itwIsIPatenteCtaEnabledSelector } from "../../common/store/selectors/remoteConfig";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { itwCredentialsRemove } from "../../credentials/store/actions";
import { trackAuthenticationStart } from "../../../fims/common/analytics";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";

type ItwPresentationDetailFooterProps = {
  credential: StoredCredential;
};
//Consts for trackAuthenticationStart function 
const serviceId = "01JEXVQSRV2XRX9XDWQ5XQ6A8T" as ServiceId;
const serviceOrganizationName = "Ministero delle infrastrutture e dei trasporti";
const serviceOrganizationFiscalCode = "97532760580";
const serviceName = "Motorizzazione Civile - Le mie patenti";

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
const getCredentialActions = (credentialType: string): React.ReactNode =>
  ({
    MDL: [<IPatenteListItemAction key="iPatenteActionMdl" />],
    EuropeanHealthInsuranceCard: [],
    EuropeanDisabilityCard: []
  }[credentialType]);

/**
 * Renders the IPatente service action item
 */
const IPatenteListItemAction = () => {
  const isIPatenteEnabled = useIOSelector(itwIsIPatenteCtaEnabledSelector);

  if (!isIPatenteEnabled) {
    return null;
  }

  const label = I18n.t(
    "features.itWallet.presentation.credentialDetails.actions.openIPatente"
  );

  return (
    <ListItemAction
      testID="openIPatenteActionTestID"
      variant="primary"
      icon="externalLink"
      label={label}
      onPress={() => {
        trackAuthenticationStart(
          serviceId,
          serviceName,
          serviceOrganizationName,
          serviceOrganizationFiscalCode,
          label,
          "message_detail"
        );
        NavigationService.navigate(FIMS_ROUTES.MAIN, {
          screen: FIMS_ROUTES.CONSENTS,
          params: {
            ctaText: label,
            ctaUrl: "https://licences.ipatente.io.pagopa.it/licences"
          }
        });
      }}
    />
  );
};

const MemoizedItwPresentationDetailsFooter = React.memo(
  ItwPresentationDetailsFooter
);

export { MemoizedItwPresentationDetailsFooter as ItwPresentationDetailsFooter };
