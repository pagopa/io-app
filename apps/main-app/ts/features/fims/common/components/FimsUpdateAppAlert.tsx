import {
  HeaderActionProps,
  HeaderSecondLevel
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useEffect } from "react";

import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useStartSupportRequest } from "../../../../hooks/useStartSupportRequest";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { openAppStoreUrl } from "../../../../utils/url";

export const FimsUpdateAppAlert = () => {
  const navigation = useIONavigation();
  useOnlySupportRequestHeader();
  return (
    <OperationResultScreenContent
      action={{
        label: I18n.t("btnUpdateApp"),
        onPress: () => openAppStoreUrl(),
        testID: "primary-update-app"
      }}
      isHeaderVisible={true}
      pictogram="updateOS"
      secondaryAction={{
        label: I18n.t("global.buttons.close"),
        onPress: navigation.goBack,
        testID: "secondary-update-app"
      }}
      subtitle={I18n.t("FIMS.updateApp.body")}
      title={I18n.t("FIMS.updateApp.header")}
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
          firstAction={{
            icon: "help" as HeaderActionProps["icon"],
            onPress: startSupportRequest,
            accessibilityLabel: I18n.t(
              "global.accessibility.contextualHelp.open.label"
            )
          }}
          title=""
          type="singleAction"
        />
      )
    });
  });
};
