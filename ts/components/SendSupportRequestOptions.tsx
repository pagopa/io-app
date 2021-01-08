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
import { findAllUsingGETDefaultDecoder } from "../../definitions/bpd/award_periods/requestTypes";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";
import { H1 } from "./core/typography/H1";
import { BaseHeader } from "./screens/BaseHeader";
import Markdown from "./ui/Markdown";
import IconFont from "./ui/IconFont";
import FooterWithButtons from "./ui/FooterWithButtons";
import { EdgeBorderComponent } from "./screens/EdgeBorderComponent";
import { IOStyles } from "./core/variables/IOStyles";
import { RawCheckBox } from "./core/selection/RawCheckBox";
import { Label } from "./core/typography/Label";
import Accordion from "./ui/Accordion";

const checkboxStyle = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-evenly"
  }
});

/**
 * Checkboxes we need as of now
 */

export enum CheckboxIDs {
  sendScreenshot = "sendScreenshot",
  sendPersonalInfo = "sendPersonalInfo"
}

/**
 * Checkbox+Label+Optional Accordion component
 */

type CheckboxFormItemProps = {
  target: CheckboxIDs;
  isChecked?: boolean;
  onToggle: () => void;
};

type CheckboxLabelMap = {
  [key in CheckboxIDs]: {
    cta: string;
    accordion?: {
      title: string;
      content: string;
    };
  };
};

const CheckboxLabelKeys: CheckboxLabelMap = {
  sendScreenshot: {
    cta: I18n.t("contextualHelp.sendScreenshot.cta")
  },
  sendPersonalInfo: {
    cta: I18n.t("contextualHelp.sendPersonalInfo.cta"),
    accordion: {
      title: I18n.t("contextualHelp.sendPersonalInfo.informativeTitle"),
      content: I18n.t("contextualHelp.sendPersonalInfo.informativeDescription")
    }
  }
};

export const CheckBoxFormItem: React.FC<CheckboxFormItemProps> = ({
  target,
  isChecked,
  onToggle
}: CheckboxFormItemProps) => (
  <View style={checkboxStyle.container}>
    <RawCheckBox checked={isChecked} onPress={onToggle} />
    <View hspacer />
    <View style={IOStyles.flex}>
      <Label
        testID="CheckboxFormItemLabel"
        color={"bluegrey"}
        weight={"Regular"}
        onPress={onToggle}
      >
        {CheckboxLabelKeys[target].cta}
      </Label>
      {"accordion" in CheckboxLabelKeys[target] && (
        <Accordion
          title={CheckboxLabelKeys[target].accordion?.title || ""}
          content={CheckboxLabelKeys[target].accordion?.content || ""}
        />
      )}
    </View>
  </View>
);

export type SupportRequestOptions = {
  sendPersonalInfo: boolean;
  sendScreenshot?: boolean;
};

type Props = {
  onClose: () => void;
  onGoBack: () => void;
  onContinue: (options: SupportRequestOptions) => void;
  supportRequestOptions?: SupportRequestOptions;
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

const DefaultSupportRequestOptions = {
  sendPersonalInfo: true,
  sendScreenshot: false
};

const SendSupportRequestOptions: React.FunctionComponent<Props> = ({
  onClose,
  onGoBack,
  onContinue,
  supportRequestOptions
}) => {
  const { sendScreenshot: shouldAskSendScreenshot } =
    supportRequestOptions || DefaultSupportRequestOptions;

  const [sendPersonalInfo, setSendPersonalInfo] = React.useState(false);
  const [sendScreenshot, setSendScreenshot] = React.useState(
    shouldAskSendScreenshot as boolean
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
        {shouldAskSendScreenshot && (
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
