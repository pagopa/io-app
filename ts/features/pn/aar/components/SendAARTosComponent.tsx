import { BodyProps } from "@pagopa/io-app-design-system";
import i18n from "i18next";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { pnPrivacyUrlsSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { openWebUrl } from "../../../../utils/url";
import { setAarFlowState } from "../store/actions";
import { sendAARFlowStates } from "../store/reducers";

type SendAARTosComponentProps = {
  qrCode: string;
};

export const SendAARTosComponent = ({ qrCode }: SendAARTosComponentProps) => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const tosConfig = useIOSelector(pnPrivacyUrlsSelector);

  const onButtonPress = () => {
    dispatch(
      setAarFlowState({
        type: sendAARFlowStates.fetchingQRData,
        qrCode
      })
    );
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
        onPress: onButtonPress,
        testID: "primary_button"
      }}
      secondaryAction={{
        label: i18n.t("features.pn.aar.flow.aarTos.secondaryAction"),
        onPress: navigation.popToTop,
        testID: "secondary_button"
      }}
    />
  );
};
