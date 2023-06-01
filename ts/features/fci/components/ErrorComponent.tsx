import * as React from "react";
import { SafeAreaView } from "react-native";
import { EmailString } from "@pagopa/ts-commons/lib/strings";
import I18n from "../../../i18n";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../components/screens/BaseScreenComponent";
import { WithTestID } from "../../../types/WithTestID";
import { FooterStackButton } from "../../bonus/bonusVacanze/components/buttons/FooterStackButtons";
import {
  addTicketCustomField,
  assistanceToolRemoteConfig,
  resetCustomFields,
  zendeskCategoryId,
  zendeskFCICategory,
  zendeskFciId
} from "../../../utils/supportAssistance";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import {
  zendeskSelectedCategory,
  zendeskSupportStart
} from "../../zendesk/store/actions";
import { fciSignatureRequestIdSelector } from "../store/reducers/fciSignatureRequest";
import { assistanceToolConfigSelector } from "../../../store/reducers/backendStatus";
import { ToolEnum } from "../../../../definitions/content/AssistanceToolConfig";
import { IOPictograms, Pictogram } from "../../../components/core/pictograms";
import { InfoScreenComponent } from "./InfoScreenComponent";

export type Props = WithTestID<{
  title: string;
  subTitle: string;
  pictogram: IOPictograms;
  email?: EmailString;
  retry?: boolean;
  assistance?: boolean;
  onPress: () => void;
}>;

const ErrorComponent = (props: Props) => {
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
        assistanceForPayment: false,
        assistanceForCard: false,
        assistanceForFci: true
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
    block: true,
    primary: true,
    onPress: props.onPress,
    title: I18n.t("features.fci.errors.buttons.retry")
  };

  const closeButtonProps = {
    testID: "FciCloseButtonTestID",
    bordered: true,
    block: true,
    onPress: props.onPress,
    title: I18n.t("features.fci.errors.buttons.close")
  };

  const assistanceButtonProps = {
    testID: "FciAssistanceButtonTestID",
    bordered: true,
    primary: false,
    block: true,
    onPress: handleAskAssistance,
    title: I18n.t("features.fci.errors.buttons.assistance")
  };

  const footerButtons = () => {
    if (props.retry && props.assistance) {
      return [retryButtonProps, assistanceButtonProps];
    }
    if (props.retry) {
      return [retryButtonProps, closeButtonProps];
    }
    if (props.assistance) {
      return [
        {
          ...closeButtonProps,
          bordered: false,
          title: I18n.t("features.fci.errors.buttons.back")
        },
        assistanceButtonProps
      ];
    }
    return [closeButtonProps];
  };

  return (
    <BaseScreenComponent goBack={false}>
      <SafeAreaView style={IOStyles.flex} testID={props.testID}>
        <InfoScreenComponent
          image={<Pictogram name={props.pictogram} />}
          title={props.title}
          body={props.subTitle}
          email={props.email}
        />
        <FooterStackButton buttons={footerButtons()} />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default ErrorComponent;
