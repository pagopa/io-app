import { Content, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import I18n from "../i18n";
import themeVariables from "../theme/variables";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";
import { CheckBox } from "./core/selection/CheckBox";
import { H1 } from "./core/typography/H1";
import { BaseHeader } from "./screens/BaseHeader";
import Accordion from "./ui/Accordion";
import Markdown from "./ui/Markdown";
import IconFont from "./ui/IconFont";
import FooterWithButtons from "./ui/FooterWithButtons";
import { heightPercentageToDP } from "react-native-responsive-screen";

type ownProps = {
  onClose: () => void;
  onGoBack: () => void;
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: themeVariables.contentPadding
  }
});
const cancelButtonProps = (onContinue: () => void) => ({
  block: true,
  light: true,
  bordered: true,
  onPress: onContinue,
  title: I18n.t("global.buttons.cancel")
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

const NewReporting: React.FunctionComponent<ownProps> = ({
  onClose,
  onGoBack
}) => (
  <>
    <BaseHeader
      accessibilityEvents={{
        avoidNavigationEventsUsage: true
      }}
      headerTitle={I18n.t("contextualHelp.title")}
      customRightIcon={{
        iconName: "io-close",
        onPress: onClose,
        accessibilityLabel: I18n.t("global.accessibility.contextualHelp.close")
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
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-evenly"
        }}
      >
        <CheckBox />
        <View hspacer={true} />
        <View style={{ flex: 1 }}>
          <Markdown>{I18n.t("contextualHelp.sendPersonalInfo.cta")}</Markdown>
          <Accordion
            title={I18n.t("contextualHelp.sendPersonalInfo.informativeTitle")}
            content={I18n.t(
              "contextualHelp.sendPersonalInfo.informativeDescription"
            )}
          ></Accordion>
        </View>
      </View>
    </Content>
    <View style={{ paddingBottom: 30 }}>
      <FooterWithButtons
        type={"SingleButton"}
        leftButton={cancelButtonProps(onClose)}
      />
    </View>
  </>
);

export default NewReporting;
