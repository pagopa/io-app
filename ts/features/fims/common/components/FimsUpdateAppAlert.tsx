import {
  HeaderActionProps,
  HeaderSecondLevel
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useStartSupportRequest } from "../../../../hooks/useStartSupportRequest";
import I18n from "../../../../i18n";
import { openAppStoreUrl } from "../../../../utils/url";

export const FimsUpdateAppAlert = () => {
  const navigation = useNavigation();
  useOnlySupportRequestHeader();
  return (
    <OperationResultScreenContent
      isHeaderVisible={true}
      title={I18n.t("FIMS.updateApp.header")}
      subtitle={I18n.t("FIMS.updateApp.body")}
      pictogram="updateOS"
      action={{
        label: I18n.t("btnUpdateApp"),
        onPress: () => openAppStoreUrl()
      }}
      secondaryAction={{
        label: I18n.t("global.buttons.close"),
        onPress: navigation.goBack
      }}
    />
  );
};

const useOnlySupportRequestHeader = () => {
  const navigation = useNavigation();
  const startSupportRequest = useStartSupportRequest({});

  React.useEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          title=""
          type="singleAction"
          firstAction={{
            icon: "help" as HeaderActionProps["icon"],
            onPress: startSupportRequest,
            accessibilityLabel: I18n.t(
              "global.accessibility.contextualHelp.open.label"
            )
          }}
        />
      )
    });
  });
};
