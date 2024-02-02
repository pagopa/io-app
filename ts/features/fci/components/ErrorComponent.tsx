import * as React from "react";
import { View } from "react-native";
import { EmailString } from "@pagopa/ts-commons/lib/strings";
import {
  ButtonOutline,
  ButtonSolid,
  ButtonSolidProps,
  IOPictograms,
  IOSpacingScale,
  IOStyles,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import {
  SafeAreaView,
  useSafeAreaInsets
} from "react-native-safe-area-context";
import I18n from "../../../i18n";
import { WithTestID } from "../../../types/WithTestID";
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

const DEFAULT_BOTTOM_PADDING: IOSpacingScale = 20;

const ErrorComponent = (props: Props) => {
  const dispatch = useIODispatch();
  const signatureRequestId = useIOSelector(fciSignatureRequestIdSelector);
  const assistanceToolConfig = useIOSelector(assistanceToolConfigSelector);
  const choosenTool = assistanceToolRemoteConfig(assistanceToolConfig);
  const insets = useSafeAreaInsets();

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

  const retryButtonProps: ButtonSolidProps = {
    testID: "FciRetryButtonTestID",
    onPress: props.onPress,
    fullWidth: true,
    label: I18n.t("features.fci.errors.buttons.retry"),
    accessibilityLabel: I18n.t("features.fci.errors.buttons.retry")
  };

  const closeButtonProps: ButtonSolidProps = {
    testID: "FciCloseButtonTestID",
    onPress: props.onPress,
    fullWidth: true,
    label: I18n.t("features.fci.errors.buttons.close"),
    accessibilityLabel: I18n.t("features.fci.errors.buttons.close")
  };

  const assistanceButtonProps: ButtonSolidProps = {
    testID: "FciAssistanceButtonTestID",
    fullWidth: true,
    onPress: handleAskAssistance,
    label: I18n.t("features.fci.errors.buttons.assistance"),
    accessibilityLabel: I18n.t("features.fci.errors.buttons.assistance")
  };

  /**
   * Render the footer buttons as vertical stacked buttons
   * @returns {React.ReactElement}
   */
  const footerButtons = () => {
    if (props.retry && props.assistance) {
      return (
        <>
          <ButtonSolid {...retryButtonProps} />
          <VSpacer size={8} />
          <ButtonOutline {...assistanceButtonProps} />
        </>
      );
    }
    if (props.retry) {
      return (
        <>
          <ButtonSolid {...retryButtonProps} />
          <VSpacer size={8} />
          <ButtonOutline {...closeButtonProps} />
        </>
      );
    }
    if (props.assistance) {
      return (
        <>
          <ButtonSolid
            {...{
              ...closeButtonProps,
              label: I18n.t("features.fci.errors.buttons.back"),
              accessibilityLabel: I18n.t("features.fci.errors.buttons.back")
            }}
          />
          <VSpacer size={8} />
          <ButtonOutline {...assistanceButtonProps} />
        </>
      );
    }
    return <ButtonOutline {...closeButtonProps} />;
  };

  return (
    <SafeAreaView
      style={IOStyles.flex}
      testID={props.testID}
      edges={["left", "right"]}
    >
      <InfoScreenComponent
        image={<Pictogram name={props.pictogram} />}
        title={props.title}
        body={props.subTitle}
        email={props.email}
      />
      <View
        style={[
          IOStyles.horizontalContentPadding,
          { paddingBottom: Math.max(insets.bottom, DEFAULT_BOTTOM_PADDING) }
        ]}
      >
        {footerButtons()}
      </View>
    </SafeAreaView>
  );
};

export default ErrorComponent;
