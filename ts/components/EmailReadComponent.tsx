import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { Platform, SafeAreaView, StyleSheet, View } from "react-native";
import I18n from "../i18n";
import { useIOSelector } from "../store/hooks";
import { profileEmailSelector } from "../store/reducers/profile";
import customVariables from "../theme/variables";
import { ContextualHelpPropsMarkdown } from "./screens/BaseScreenComponent";
import ScreenContent from "./screens/ScreenContent";
import TopScreenComponent from "./screens/TopScreenComponent";
import SectionStatusComponent from "./SectionStatus";
import { BlockButtonsProps } from "./ui/BlockButtons";
import FooterWithButtons from "./ui/FooterWithButtons";
import IconFont from "./ui/IconFont";
import { Body } from "./core/typography/Body";
import { VSpacer } from "./core/spacer/Spacer";
import { H3 } from "./core/typography/H3";

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  emailWithIcon: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  content: {
    paddingHorizontal: customVariables.contentPadding,
    backgroundColor: customVariables.contentBackground,
    flex: 1
  },
  icon: {
    marginTop: Platform.OS === "android" ? 3 : 0, // correct icon position to align it with baseline of email text
    marginRight: 8
  }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.data.email.contextualHelpTitle",
  body: "profile.data.email.contextualHelpContent"
};

type Props = {
  handleGoBack: () => void;
  footerProps: BlockButtonsProps;
};

const EmailReadComponent = ({ handleGoBack, footerProps }: Props) => {
  const optionEmail = useIOSelector(profileEmailSelector);

  return (
    <SafeAreaView style={styles.flex}>
      <TopScreenComponent
        goBack={handleGoBack}
        headerTitle={I18n.t("profile.data.list.email")}
        contextualHelpMarkdown={contextualHelpMarkdown}
      >
        <ScreenContent title={I18n.t("email.read.title")}>
          <View style={styles.content}>
            <Body>{I18n.t("email.insert.label")}</Body>
            <VSpacer size={8} />
            <View style={styles.emailWithIcon}>
              <IconFont
                name="io-envelope"
                accessible={true}
                accessibilityLabel={I18n.t("email.read.title")}
                size={24}
                style={styles.icon}
              />
              {O.isSome(optionEmail) && <H3>{optionEmail.value}</H3>}
            </View>
            <VSpacer size={24} />
            <Body color="bluegrey">{`${I18n.t("email.read.details")}`}</Body>
          </View>
        </ScreenContent>
        <SectionStatusComponent sectionKey={"email_validation"} />
        <FooterWithButtons {...footerProps} />
      </TopScreenComponent>
    </SafeAreaView>
  );
};

export default EmailReadComponent;
