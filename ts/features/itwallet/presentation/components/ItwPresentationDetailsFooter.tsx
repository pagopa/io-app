import {
  ListItemAction,
  WithTestID,
  useIOToast
} from "@pagopa/io-app-design-system";
import React from "react";
import { Alert, View } from "react-native";
import { useStartSupportRequest } from "../../../../hooks/useStartSupportRequest";
import I18n from "../../../../i18n";
import NavigationService from "../../../../navigation/NavigationService";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOStore } from "../../../../store/hooks";
import { FIMS_ROUTES } from "../../../fims/common/navigation";
import {
  CREDENTIALS_MAP,
  trackCredentialDeleteProperties,
  trackItwCredentialDelete,
  trackWalletCredentialSupport
} from "../../analytics";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { itwCredentialsRemove } from "../../credentials/store/actions";

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

  /**
   * Credential specific actions
   */
  const credentialCtas = React.useMemo(() => {
    if (credential.credentialType === "MDL") {
      return [
        <FimsListItemAction
          key="openIPatenteAction"
          testID="openIPatenteActionTestID"
          url="https://licences.ipatente.io.pagopa.it/licences"
          label={I18n.t(
            "features.itWallet.presentation.credentialDetails.actions.openIPatente"
          )}
        />
      ];
    }

    return [];
  }, [credential.credentialType]);

  return (
    <View>
      {credentialCtas}
      <ListItemAction
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

type FimsListItemActionProps = {
  url: string;
  label: string;
};

/**
 * ListItemAction which handles an url using FIMS
 * @param url - The url to handle
 * @param label - The label of the action
 * @param testID - The testID of the action
 * @returns A ListItemAction which handles an url using FIMS
 */
const FimsListItemAction = ({
  url,
  label,
  testID
}: WithTestID<FimsListItemActionProps>) => (
  <ListItemAction
    testID={testID}
    variant="primary"
    icon="externalLink"
    label={label}
    accessibilityLabel={label}
    onPress={() => {
      NavigationService.navigate(FIMS_ROUTES.MAIN, {
        screen: FIMS_ROUTES.CONSENTS,
        params: {
          ctaText: label,
          ctaUrl: url
        }
      });
    }}
  />
);

const MemoizedItwPresentationDetailsFooter = React.memo(
  ItwPresentationDetailsFooter
);

export { MemoizedItwPresentationDetailsFooter as ItwPresentationDetailsFooter };
