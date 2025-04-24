import {
  IOButton,
  IOButtonBlockSpecificProps,
  IOPictograms,
  IOSpacingScale,
  IOStyles,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import { EmailString } from "@pagopa/ts-commons/lib/strings";
import { View } from "react-native";
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

  const retryButtonProps: Omit<IOButtonBlockSpecificProps, "variant"> = {
    testID: "FciRetryButtonTestID",
    onPress: props.onPress,
    fullWidth: true,
    label: I18n.t("features.fci.errors.buttons.retry")
  };

  const closeButtonProps: Omit<IOButtonBlockSpecificProps, "variant"> = {
    testID: "FciCloseButtonTestID",
    onPress: props.onPress,
    fullWidth: true,
    label: I18n.t("features.fci.errors.buttons.close")
  };

  const assistanceButtonProps: Omit<IOButtonBlockSpecificProps, "variant"> = {
    testID: "FciAssistanceButtonTestID",
    fullWidth: true,
    onPress: handleAskAssistance,
    label: I18n.t("features.fci.errors.buttons.assistance")
  };

  /**
   * Render the footer buttons as vertical stacked buttons
   * @returns {ReactElement}
   */
  const footerButtons = () => {
    if (props.retry && props.assistance) {
      return (
        <>
          <IOButton variant="solid" {...retryButtonProps} />
          <VSpacer size={8} />
          <IOButton variant="outline" {...assistanceButtonProps} />
        </>
      );
    }
    if (props.retry) {
      return (
        <>
          <IOButton variant="solid" {...retryButtonProps} />
          <VSpacer size={8} />
          <IOButton variant="outline" {...closeButtonProps} />
        </>
      );
    }
    if (props.assistance) {
      return (
        <>
          <IOButton
            variant="solid"
            {...{
              ...closeButtonProps,
              label: I18n.t("features.fci.errors.buttons.back")
            }}
          />
          <VSpacer size={8} />
          <IOButton variant="outline" {...assistanceButtonProps} />
        </>
      );
    }
    return <IOButton variant="outline" {...closeButtonProps} />;
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={IOStyles.flex}
      testID={props.testID}
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
