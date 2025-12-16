import { BodyProps } from "@pagopa/io-app-design-system";
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

  const bodyPropsArray: Array<BodyProps> = [
    {
      text: i18n.t("features.pn.aar.flow.aarTos.body.firstPart")
    },
    {
      text: i18n.t("features.pn.aar.flow.aarTos.body.goToNotification"),
      weight: "Semibold"
    },
    {
      text: i18n.t("features.pn.aar.flow.aarTos.body.youDeclareThat")
    },
    {
      asLink: true,
      weight: "Semibold",
      avoidPressable: true,
      text: i18n.t("features.pn.aar.flow.aarTos.body.privacy"),
      onPress: () => openWebUrl(tosConfig.privacy),
      testID: "privacy"
    },
    { text: i18n.t("features.pn.aar.flow.aarTos.body.andThe") },
    {
      asLink: true,
      weight: "Semibold",
      avoidPressable: true,
      text: i18n.t("features.pn.aar.flow.aarTos.body.tos"),
      onPress: () => openWebUrl(tosConfig.tos),
      testID: "tos"
    },
    { text: i18n.t("features.pn.aar.flow.aarTos.body.lineEnding") }
  ];
  return (
    <OperationResultScreenContent
      testID="AAR_TOS"
      title={i18n.t("features.pn.aar.flow.aarTos.title")}
      pictogram="doc"
      subtitle={bodyPropsArray}
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
