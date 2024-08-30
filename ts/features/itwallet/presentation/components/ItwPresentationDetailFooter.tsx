import {
  Chip,
  IOStyles,
  ListItemAction,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { Linking, View } from "react-native";
import I18n from "../../../../i18n";
import { format } from "../../../../utils/dates";
import { IssuerConfiguration } from "../../common/utils/itwTypesUtils";

type Props = {
  lastUpdateTime: Date;
  issuerConf: IssuerConfiguration;
};

export const ItwPresentationDetailFooter = ({
  lastUpdateTime,
  issuerConf
}: Props) => (
  <View>
    <ListItemAction
      variant="primary"
      icon="message"
      label={I18n.t(
        "features.itWallet.presentation.credentialDetails.actions.requestAssistance",
        { authSource: issuerConf.federation_entity.organization_name }
      )}
      accessibilityLabel={I18n.t(
        "features.itWallet.presentation.credentialDetails.actions.requestAssistance",
        { authSource: issuerConf.federation_entity.organization_name }
      )}
      onPress={() =>
        Linking.openURL(`mailto:${issuerConf.federation_entity.contacts?.[0]}`)
      }
    />
    <VSpacer size={24} />
    <Chip color="grey-650" style={IOStyles.selfCenter}>
      {I18n.t("features.itWallet.presentation.credentialDetails.lastUpdated", {
        lastUpdateTime: format(lastUpdateTime, "DD MMMM YYYY, HH:mm")
      })}
    </Chip>
  </View>
);
