import { ActionProp, HeaderSecondLevel } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useStartSupportRequest } from "../../../../hooks/useStartSupportRequest";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
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
  const startSupportRequest = useStartSupportRequest({
    faqCategories: undefined,
    contextualHelpMarkdown: undefined,
    contextualHelp: emptyContextualHelp
  });

  React.useEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          title=""
          type="singleAction"
          firstAction={{
            icon: "help" as ActionProp["icon"],
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
