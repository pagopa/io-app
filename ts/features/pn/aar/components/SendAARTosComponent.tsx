import i18n from "i18next";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIOSelector } from "../../../../store/hooks";
import { pnPrivacyUrlsSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { openWebUrl } from "../../../../utils/url";
import { useSendAarFlowManager } from "../hooks/useSendAarFlowManager";
import { trackSendAARToSDismissed } from "../analytics";

export const SendAARTosComponent = () => {
  const tosConfig = useIOSelector(pnPrivacyUrlsSelector);
  const { goToNextState, terminateFlow } = useSendAarFlowManager();

  const onSecondaryAction = () => {
    trackSendAARToSDismissed();
    terminateFlow();
  };

  return (
    <OperationResultScreenContent
      testID="AAR_TOS"
      title={i18n.t("features.pn.aar.flow.aarTos.title")}
      pictogram="doc"
      subtitle={i18n.t("features.pn.aar.flow.aarTos.body", {
        privacyUrl: tosConfig.privacy,
        tosUrl: tosConfig.tos
      })}
      onSubtitleLinkPress={openWebUrl}
      action={{
        label: i18n.t("features.pn.aar.flow.aarTos.primaryAction"),
        onPress: goToNextState,
        testID: "primary_button"
      }}
      secondaryAction={{
        label: i18n.t("features.pn.aar.flow.aarTos.secondaryAction"),
        onPress: onSecondaryAction,
        testID: "secondary_button"
      }}
    />
  );
};
