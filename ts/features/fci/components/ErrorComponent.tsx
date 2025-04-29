import {
  ButtonOutline,
  ButtonSolid,
  ContentWrapper,
  IOPictograms,
  IOSpacingScale,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import { EmailString } from "@pagopa/ts-commons/lib/strings";
import {
  SafeAreaView,
  useSafeAreaInsets
} from "react-native-safe-area-context";
import { ToolEnum } from "../../../../definitions/content/AssistanceToolConfig";
import I18n from "../../../i18n";
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

  const retryButtonProps: ButtonOutline = {
    testID: "FciRetryButtonTestID",
    onPress: props.onPress,
    fullWidth: true,
    label: I18n.t("features.fci.errors.buttons.retry"),
    accessibilityLabel: I18n.t("features.fci.errors.buttons.retry")
  };

  const closeButtonProps: ButtonOutline = {
    testID: "FciCloseButtonTestID",
    onPress: props.onPress,
    fullWidth: true,
    label: I18n.t("features.fci.errors.buttons.close"),
    accessibilityLabel: I18n.t("features.fci.errors.buttons.close")
  };

  const assistanceButtonProps: ButtonOutline = {
    testID: "FciAssistanceButtonTestID",
    fullWidth: true,
    onPress: handleAskAssistance,
    label: I18n.t("features.fci.errors.buttons.assistance"),
    accessibilityLabel: I18n.t("features.fci.errors.buttons.assistance")
  };

  /**
   * Render the footer buttons as vertical stacked buttons
   * @returns {ReactElement}
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
      edges={["top", "left", "right"]}
      style={{ flex: 1 }}
      testID={props.testID}
    >
      <InfoScreenComponent
        image={<Pictogram name={props.pictogram} />}
        title={props.title}
        body={props.subTitle}
        email={props.email}
      />
      <ContentWrapper
        style={{
          paddingBottom: Math.max(insets.bottom, DEFAULT_BOTTOM_PADDING)
        }}
      >
        {/* TODO: Add `FooterActions` component. Replace all the custom code here. */}
        {footerButtons()}
      </ContentWrapper>
    </SafeAreaView>
  );
};

export default ErrorComponent;
