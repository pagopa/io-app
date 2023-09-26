import {
  Body,
  H2,
  IOStyles,
  ListItemAction,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { Alert, View } from "react-native";
import { Link } from "../../../../components/core/typography/Link";
import TopScreenComponent from "../../../../components/screens/TopScreenComponent";
import I18n from "../../../../i18n";
import { identificationRequest } from "../../../../store/actions/identification";
import { useIODispatch } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";

export const IdPayCodeRenewScreen = () => {
  const dispatch = useIODispatch();

  const handleConfirm = () => {
    dispatch(
      identificationRequest(
        false,
        true,
        undefined,
        {
          label: I18n.t("global.buttons.cancel"),
          onCancel: () => undefined
        },
        {
          onSuccess: () => null // TODO: handle success
        }
      )
    );
  };

  return (
    <TopScreenComponent
      customGoBack={false}
      dark={false}
      goBack={true}
      contextualHelp={emptyContextualHelp}
    >
      <View style={IOStyles.horizontalContentPadding}>
        <H2>{I18n.t("idpay.code.renew.screen.header")}</H2>
        <VSpacer size={16} />
        <Body>{I18n.t("idpay.code.renew.screen.body")}</Body>
        <Link>{I18n.t("idpay.code.renew.screen.link")}</Link>
        <VSpacer size={16} />
        <ListItemAction
          label={I18n.t("idpay.code.renew.screen.generateCTA")}
          onPress={() => customAlert(handleConfirm)}
          icon="reload" // FIXME:: update to "change" once new DS ver is released (SEE #IOBP-277)
          accessibilityLabel={I18n.t("idpay.code.renew.screen.generateCTA")}
          variant="danger"
        />
      </View>
    </TopScreenComponent>
  );
};

// -------------------------- utils --------------------------

const customAlert = (handleConfirm: () => void) =>
  Alert.alert(
    I18n.t("idpay.code.renew.alert.title"),

    I18n.t("idpay.code.renew.alert.body"),
    [
      {
        text: I18n.t("global.buttons.continue"),
        onPress: handleConfirm,
        style: "destructive"
      },
      {
        text: I18n.t("global.buttons.cancel"),
        style: "cancel"
      }
    ]
  );
