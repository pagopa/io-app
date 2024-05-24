import React from "react";
import { Alert, View } from "react-native";
import {
  ListItemAction,
  VSpacer,
  Chip,
  IOStyles
} from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";

type Props = {
  lastUpdateTime: string;
};

export const ItwPresentationDetailFooter = ({ lastUpdateTime }: Props) => (
  <View>
    <ListItemAction
      variant="primary"
      icon="message"
      label={I18n.t(
        "features.itWallet.presentation.credentialDetails.actions.requestAssistance"
      )}
      accessibilityLabel={I18n.t(
        "features.itWallet.presentation.credentialDetails.actions.requestAssistance"
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
      onPress={() => Alert.alert("Assistance")}
    />

    <VSpacer size={24} />
    <Chip color="grey-650" style={IOStyles.selfCenter}>
      {I18n.t("features.itWallet.presentation.credentialDetails.lastUpdated", {
        lastUpdateTime
      })}
    </Chip>
  </View>
);
