import i18n from "i18next";

import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIOSelector } from "../../../../store/hooks";
import { pnPrivacyUrlsSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { openWebUrl } from "../../../../utils/url";
import { trackSendAarToSDismissed } from "../analytics";
import { useSendAarFlowManager } from "../hooks/useSendAarFlowManager";

export const SendAarTosComponent = () => {
  const tosConfig = useIOSelector(pnPrivacyUrlsSelector);
  const { goToNextState, terminateFlow } = useSendAarFlowManager();

  const onSecondaryAction = () => {
    trackSendAarToSDismissed();
    terminateFlow();
  };

  return (
    <OperationResultScreenContent
      action={{
        label: i18n.t("features.pn.aar.flow.aarTos.primaryAction"),
        onPress: goToNextState,
        testID: "primary_button"
      }}
      onSubtitleLinkPress={openWebUrl}
      pictogram="doc"
      secondaryAction={{
        label: i18n.t("features.pn.aar.flow.aarTos.secondaryAction"),
        onPress: onSecondaryAction,
        testID: "secondary_button"
      }}
      subtitle={i18n.t("features.pn.aar.flow.aarTos.body", {
        privacyUrl: tosConfig.privacy,
        tosUrl: tosConfig.tos
      })}
      testID="AAR_TOS"
      title={i18n.t("features.pn.aar.flow.aarTos.title")}
    />
  );
};
