import { BodyProps, IOPictograms } from "@pagopa/io-app-design-system";
import { EmailString } from "@pagopa/ts-commons/lib/strings";
import I18n from "i18next";
import { Linking } from "react-native";
import { ToolEnum } from "../../../../definitions/content/AssistanceToolConfig";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../components/screens/OperationResultScreenContent";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { assistanceToolConfigSelector } from "../../../store/reducers/backendStatus/remoteConfig";
import { WithTestID } from "../../../types/WithTestID";
import {
  addTicketCustomField,
  assistanceToolRemoteConfig,
  resetCustomFields,
  zendeskCategoryId,
  zendeskFCICategory,
  zendeskFciId
} from "../../../utils/supportAssistance";
import {
  zendeskSelectedCategory,
  zendeskSupportStart
} from "../../zendesk/store/actions";
import { fciSignatureRequestIdSelector } from "../store/reducers/fciSignatureRequest";

export type Props = WithTestID<{
  title: string;
  subTitle: string;
  pictogram: IOPictograms;
  email?: EmailString;
  retry?: boolean;
  assistance?: boolean;
  onPress: () => void;
}>;

const SignatureStatusComponent = ({
  title,
  subTitle,
  email,
  pictogram,
  retry,
  assistance,
  onPress,
  testID
}: Props) => {
  const dispatch = useIODispatch();
  const signatureRequestId = useIOSelector(fciSignatureRequestIdSelector);
  const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
  const choosenTool = assistanceToolRemoteConfig(assistanceToolConfig);

  const zendeskAssistanceLogAndStart = () => {
    resetCustomFields();
    addTicketCustomField(zendeskCategoryId, zendeskFCICategory.value);
    addTicketCustomField(zendeskFciId, signatureRequestId ?? "");
    dispatch(
      zendeskSupportStart({
        startingRoute: "n/a",
        assistanceType: {
          fci: true
        }
      })
    );
    dispatch(zendeskSelectedCategory(zendeskFCICategory));
  };

  const handleAskAssistance = () => {
    switch (choosenTool) {
      case ToolEnum.zendesk:
        zendeskAssistanceLogAndStart();
        break;
    }
  };

  const retryButtonProps = {
    testID: "FciRetryButtonTestID",
    onPress,
    label: I18n.t("features.fci.errors.buttons.retry")
  };

  const closeButtonProps = {
    testID: "FciCloseButtonTestID",
    onPress,
    label: I18n.t("features.fci.errors.buttons.close")
  };

  const assistanceButtonProps = {
    testID: "FciAssistanceButtonTestID",
    onPress: handleAskAssistance,
    label: I18n.t("features.fci.errors.buttons.assistance")
  };

  type OperationResultButtons = Pick<
    OperationResultScreenContentProps,
    "action" | "secondaryAction"
  >;

  const operationResultActions = (): OperationResultButtons => {
    if (retry && assistance) {
      return {
        action: retryButtonProps,
        secondaryAction: assistanceButtonProps
      };
    }
    if (retry) {
      return {
        action: retryButtonProps,
        secondaryAction: closeButtonProps
      };
    }
    if (assistance) {
      return {
        action: {
          ...closeButtonProps,
          label: I18n.t("features.fci.errors.buttons.back")
        },
        secondaryAction: assistanceButtonProps
      };
    }
    return {
      action: closeButtonProps
    };
  };

  /* This is a result of a quick refactor. If there's an additional email address,
  we compose the different `Body` components, otherwise we just display the text. */
  const operationResultComposedBody: Array<BodyProps> = email
    ? [
        {
          text: `${subTitle}\n`,
          style: {
            textAlign: "center"
          }
        },
        {
          asLink: true,
          avoidPressable: true,
          onPress: () => Linking.openURL(`mailto:${email}`),
          text: email,
          style: {
            textAlign: "center"
          },
          weight: "Semibold"
        }
      ]
    : [
        {
          text: subTitle,
          style: {
            textAlign: "center"
          }
        }
      ];

  return (
    <OperationResultScreenContent
      isHeaderVisible={false}
      title={title}
      subtitle={operationResultComposedBody}
      pictogram={pictogram}
      testID={testID}
      {...operationResultActions()}
    />
  );
};

export default SignatureStatusComponent;
