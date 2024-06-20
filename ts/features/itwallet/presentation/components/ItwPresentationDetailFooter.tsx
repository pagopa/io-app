import React from "react";
import { Alert, View } from "react-native";
import {
  ListItemAction,
  VSpacer,
  Chip,
  IOStyles
} from "@pagopa/io-app-design-system";
import { format } from "../../../../utils/dates";
import I18n from "../../../../i18n";

type Props = {
  lastUpdateTime: Date;
};

export const ItwPresentationDetailFooter = ({ lastUpdateTime }: Props) => (
  <View>
    <ListItemAction
      variant="primary"
      icon="message"
      label={I18n.t(
        "features.itWallet.presentation.credentialDetails.actions.requestAssistance",
        { authSource: "AuthSource" }
      )}
      accessibilityLabel={I18n.t(
        "features.itWallet.presentation.credentialDetails.actions.requestAssistance",
        { authSource: "AuthSource" }
      )}
      onPress={() => Alert.alert("Assistance")}
    />
    <ListItemAction
      variant="danger"
      icon="trashcan"
      label={I18n.t(
        "features.itWallet.presentation.credentialDetails.actions.removeFromWallet"
      )}
      accessibilityLabel={I18n.t(
        "features.itWallet.presentation.credentialDetails.actions.removeFromWallet"
      )}
      onPress={() => Alert.alert("Remove")}
    />
    <VSpacer size={24} />
    <Chip color="grey-650" style={IOStyles.selfCenter}>
      {I18n.t("features.itWallet.presentation.credentialDetails.lastUpdated", {
        lastUpdateTime: format(lastUpdateTime, "DD MMMM YYYY, HH:mm")
      })}
    </Chip>
  </View>
);
