import { Content, View } from "native-base";
import * as React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { heightPercentageToDP } from "react-native-responsive-screen";
import I18n from "../i18n";
import themeVariables from "../theme/variables";
import {
  DefaultReportAttachmentTypeConfiguration,
  noAttachmentTypeConfiguration
} from "../boot/configureInstabug";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";
import { H1 } from "./core/typography/H1";
import { BaseHeader } from "./screens/BaseHeader";
import Markdown from "./ui/Markdown";
import IconFont from "./ui/IconFont";
import FooterWithButtons from "./ui/FooterWithButtons";
import { EdgeBorderComponent } from "./screens/EdgeBorderComponent";
import { IOStyles } from "./core/variables/IOStyles";
import CheckBoxFormItem, {
  CheckboxIDs
} from "./core/selection/CheckBoxFormItem";

type Props = {
  onClose: () => void;
  onGoBack: () => void;
  onContinue: (options: SupportRequestOptions) => void;
  reportAttachmentTypes?: DefaultReportAttachmentTypeConfiguration;
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: themeVariables.contentPadding
  }
});
const continueButtonProps = (onContinue: () => void) => ({
  block: true,
  primary: true,
  onPress: onContinue,
  title: I18n.t("global.buttons.continue")
});

const CustomGoBackButton: React.FunctionComponent<{
  onPressHandler: () => void;
}> = ({ onPressHandler }) => (
  <ButtonDefaultOpacity
    accessibilityLabel={I18n.t("global.buttons.back")}
    transparent={true}
    onPress={onPressHandler}
  >
    <IconFont name={"io-back"} style={{ color: themeVariables.colorBlack }} />
  </ButtonDefaultOpacity>
);

export type SupportRequestOptions = {
  sendPersonalInfo: boolean;
  sendScreenshot?: boolean;
};

const SendSupportRequestOptions: React.FunctionComponent<Props> = ({
  onClose,
  onGoBack,
  onContinue,
  reportAttachmentTypes
}) => {
  const { screenshot: shouldShowScreenshotCheckbox } =
    reportAttachmentTypes || noAttachmentTypeConfiguration;

  const [sendPersonalInfo, setSendPersonalInfo] = React.useState(false);
  const [sendScreenshot, setSendScreenshot] = React.useState(
    shouldShowScreenshotCheckbox as boolean
  );
  const toggleSendScreenshot = () => setSendScreenshot(oldValue => !oldValue);
  const toggleSendPersonalInfo = () =>
    setSendPersonalInfo(oldValue => !oldValue);

  return (
    <SafeAreaView style={IOStyles.flex}>
      <BaseHeader
        accessibilityEvents={{
          avoidNavigationEventsUsage: true
        }}
        headerTitle={I18n.t("contextualHelp.title")}
        customRightIcon={{
          iconName: "io-close",
          onPress: onClose,
          accessibilityLabel: I18n.t(
            "global.accessibility.contextualHelp.close"
          )
        }}
        customGoBack={<CustomGoBackButton onPressHandler={onGoBack} />}
        showInstabugChat={false}
      />
      <Content contentContainerStyle={styles.contentContainer} noPadded={true}>
        <H1 accessible={true}>
          {I18n.t("contextualHelp.sendPersonalInfo.title")}
        </H1>
        <View spacer={true} />
        <View style={{ height: heightPercentageToDP(50) }}>
          <Markdown>
            {I18n.t("contextualHelp.sendPersonalInfo.description")}
          </Markdown>
        </View>
        <CheckBoxFormItem
          target={CheckboxIDs.sendPersonalInfo}
          isChecked={sendPersonalInfo}
          onToggle={toggleSendPersonalInfo}
        />
        {shouldShowScreenshotCheckbox && (
          <CheckBoxFormItem
            target={CheckboxIDs.sendScreenshot}
            isChecked={sendScreenshot}
            onToggle={toggleSendScreenshot}
          />
        )}
        <EdgeBorderComponent />
      </Content>
      <FooterWithButtons
        type={"SingleButton"}
        leftButton={continueButtonProps(() =>
          onContinue({
            sendPersonalInfo,
            sendScreenshot
          })
        )}
      />
    </SafeAreaView>
  );
};

export default SendSupportRequestOptions;
