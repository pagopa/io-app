import {
  Chip,
  IOStyles,
  ListItemAction,
  useIOToast,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { Alert, Linking, View } from "react-native";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { format } from "../../../../utils/dates";
import { itwCredentialNameByCredentialType } from "../../common/utils/itwCredentialUtils";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { itwCredentialsRemove } from "../../credentials/store/actions";

// TODO: use the real credential update time
const lastUpdateTime = new Date();

type Props = {
  credential: StoredCredential;
};

export const ItwPresentationDetailFooter = ({ credential }: Props) => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const toast = useIOToast();

  const handleRemoveCredential = () => {
    dispatch(itwCredentialsRemove(credential));
    toast.success(
      I18n.t("features.itWallet.presentation.credentialDetails.toast.removed", {
        credentialName:
          itwCredentialNameByCredentialType[credential.credentialType]
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
      <VSpacer size={24} />
      <Chip color="grey-650" style={IOStyles.selfCenter}>
        {I18n.t(
          "features.itWallet.presentation.credentialDetails.lastUpdated",
          {
            lastUpdateTime: format(lastUpdateTime, "DD MMMM YYYY, HH:mm")
          }
        )}
      </Chip>
    </View>
  );
};
