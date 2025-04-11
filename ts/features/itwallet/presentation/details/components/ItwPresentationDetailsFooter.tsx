import { ListItemAction, useIOToast } from "@pagopa/io-app-design-system";
import { memo, ReactNode, useMemo } from "react";
import { Alert, View } from "react-native";
import { useStartSupportRequest } from "../../../../../hooks/useStartSupportRequest.ts";
import I18n from "../../../../../i18n.ts";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../../store/hooks.ts";
import {
  CREDENTIALS_MAP,
  trackCredentialDeleteProperties,
  trackItwCredentialDelete,
  trackWalletCredentialSupport
} from "../../../analytics";
import { itwIPatenteCtaConfigSelector } from "../../../common/store/selectors/remoteConfig.ts";
import { StoredCredential } from "../../../common/utils/itwTypesUtils.ts";
import { itwCredentialsRemove } from "../../../credentials/store/actions";
import { useFIMSRemoteServiceConfiguration } from "../../../../fims/common/hooks/index.tsx";
import { useOfflineGuard } from "../../../../../hooks/useOfflineGuard.ts";
import { getCredentialDocumentNumber } from "../../../trustmark/utils";

type ItwPresentationDetailFooterProps = {
  credential: StoredCredential;
};

type IPatenteListItemActionProps = {
  docNumber?: string;
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

  const startAndTrackSupportRequest = useOfflineGuard(() => {
    trackWalletCredentialSupport(CREDENTIALS_MAP[credential.credentialType]);
    startSupportRequest();
  });

  const docNumber = getCredentialDocumentNumber(credential.parsedCredential);
  const credentialActions = useMemo(
    () => getCredentialActions(credential.credentialType, docNumber),
    [credential.credentialType, docNumber]
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
const getCredentialActions = (
  credentialType: string,
  docNumber?: string
): ReactNode =>
  ({
    MDL: [
      <IPatenteListItemAction key="iPatenteActionMdl" docNumber={docNumber} />
    ],
    EuropeanHealthInsuranceCard: [],
    EuropeanDisabilityCard: []
  }[credentialType]);

/**
 * Renders the IPatente service action item
 */
const IPatenteListItemAction = ({ docNumber }: IPatenteListItemActionProps) => {
  const { startFIMSAuthenticationFlow } =
    useFIMSRemoteServiceConfiguration("iPatente");
  const ctaConfig = useIOSelector(itwIPatenteCtaConfigSelector);

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
      onPress={() => startFIMSAuthenticationFlow(label, iPatenteUrl)}
    />
  );
};

const MemoizedItwPresentationDetailsFooter = memo(ItwPresentationDetailsFooter);

export { MemoizedItwPresentationDetailsFooter as ItwPresentationDetailsFooter };
