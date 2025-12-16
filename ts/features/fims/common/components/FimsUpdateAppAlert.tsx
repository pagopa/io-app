import {
  HeaderActionProps,
  HeaderSecondLevel
} from "@pagopa/io-app-design-system";
import { useEffect } from "react";
import I18n from "i18next";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useStartSupportRequest } from "../../../../hooks/useStartSupportRequest";
import { openAppStoreUrl } from "../../../../utils/url";

export const FimsUpdateAppAlert = () => {
  const navigation = useIONavigation();
  useOnlySupportRequestHeader();
  return (
    <OperationResultScreenContent
      isHeaderVisible={true}
      title={I18n.t("FIMS.updateApp.header")}
      subtitle={I18n.t("FIMS.updateApp.body")}
      pictogram="updateOS"
      action={{
        label: I18n.t("btnUpdateApp"),
        onPress: () => openAppStoreUrl(),
        testID: "primary-update-app"
      }}
      secondaryAction={{
        label: I18n.t("global.buttons.close"),
        onPress: navigation.goBack,
        testID: "secondary-update-app"
      }}
    />
  );
};

const useOnlySupportRequestHeader = () => {
  const navigation = useIONavigation();
  const startSupportRequest = useStartSupportRequest({});

  useEffect(() => {
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
