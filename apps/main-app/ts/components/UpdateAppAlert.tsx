import { HeaderActionProps, HeaderSecondLevel } from "@io-app/design-system";
import I18n from "i18next";
import { useEffect } from "react";

import { useStartSupportRequest } from "../hooks/useStartSupportRequest";
import { useIONavigation } from "../navigation/params/AppParamsList";
import { useOnFirstRender } from "../utils/hooks/useOnFirstRender";
import { openAppStoreUrl } from "../utils/url";
import { RequiredUpdateMixPanelTracking } from "./helpers/withAppRequiredUpdate";
import { OperationResultScreenContent } from "./screens/OperationResultScreenContent";

type Props = {
  mixPanelTracking?: RequiredUpdateMixPanelTracking;
};

export const UpdateAppAlert = ({ mixPanelTracking }: Props) => {
  const navigation = useIONavigation();
  useOnlySupportRequestHeader();

  useOnFirstRender(() => {
    if (mixPanelTracking?.onLanding) {
      mixPanelTracking.onLanding();
    }
  });

  return (
    <OperationResultScreenContent
      action={{
        label: I18n.t("btnUpdateApp"),
        onPress: () => {
          if (mixPanelTracking?.onConfirm) {
            mixPanelTracking.onConfirm();
          }
          void openAppStoreUrl();
        },
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
