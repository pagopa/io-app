import {
  ContentWrapper,
  ListItemAction,
  useIOToast,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { Alert } from "react-native";
import { useStartSupportRequest } from "../../../../hooks/useStartSupportRequest";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOStore } from "../../../../store/hooks";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { itwCredentialsRemove } from "../../credentials/store/actions";
import {
  CREDENTIALS_MAP,
  trackItwCredentialDelete,
  trackWalletCredentialSupport
} from "../../analytics";
import { updateMixpanelSuperProperties } from "../../../../mixpanelConfig/superProperties";
import { updateMixpanelProfileProperties } from "../../../../mixpanelConfig/profileProperties";

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
    void updateMixpanelSuperProperties(store.getState(), {
      property: CREDENTIALS_MAP[credential.credentialType],
      value: "not_available"
    });
    void updateMixpanelProfileProperties(store.getState(), {
      property: CREDENTIALS_MAP[credential.credentialType],
      value: "not_available"
    });

    navigation.pop();
  };

  const showRemoveCredentialDialog = () => {
    trackItwCredentialDelete(credential.credential);
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
    trackWalletCredentialSupport(credential.credential);
    startSupportRequest();
  };

  return (
    <ContentWrapper>
      <VSpacer size={8} />
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
      {credential.credentialType !== CredentialType.PID ? (
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
      ) : null}
    </ContentWrapper>
  );
};

const MemoizedItwPresentationDetailsFooter = React.memo(
  ItwPresentationDetailsFooter
);

export { MemoizedItwPresentationDetailsFooter as ItwPresentationDetailsFooter };
