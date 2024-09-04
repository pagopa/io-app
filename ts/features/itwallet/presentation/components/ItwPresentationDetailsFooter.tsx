import { ListItemAction, useIOToast } from "@pagopa/io-app-design-system";
import React from "react";
import { Alert, Linking, View } from "react-native";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { itwCredentialsRemove } from "../../credentials/store/actions";

type ItwPresentationDetailFooterProps = {
  credential: StoredCredential;
};

const ItwPresentationDetailsFooter = ({
  credential
}: ItwPresentationDetailFooterProps) => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const toast = useIOToast();

  const handleRemoveCredential = () => {
    dispatch(itwCredentialsRemove(credential));
    toast.success(
      I18n.t("features.itWallet.presentation.credentialDetails.toast.removed", {
        credentialName: getCredentialNameFromType(credential.credentialType)
      })
    );
    navigation.pop();
  };

  const showRemoveCredentialDialog = () =>
    Alert.alert(
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

  const { federation_entity } = credential.issuerConf;

  return (
    <View>
      <ListItemAction
        variant="primary"
        icon="message"
        label={I18n.t(
          "features.itWallet.presentation.credentialDetails.actions.requestAssistance",
          { authSource: federation_entity.organization_name }
        )}
        accessibilityLabel={I18n.t(
          "features.itWallet.presentation.credentialDetails.actions.requestAssistance",
          { authSource: federation_entity.organization_name }
        )}
        onPress={() =>
          Linking.openURL(`mailto:${federation_entity.contacts?.[0]}`)
        }
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
    </View>
  );
};

const MemoizedItwPresentationDetailsFooter = React.memo(
  ItwPresentationDetailsFooter
);

export { MemoizedItwPresentationDetailsFooter as ItwPresentationDetailsFooter };
