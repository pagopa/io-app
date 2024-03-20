import {
  ContentWrapper,
  FooterWithButtons,
  Icon,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { ComponentProps } from "react";
import { Platform, StyleSheet, View } from "react-native";
import I18n from "../i18n";
import { useIOSelector } from "../store/hooks";
import { profileEmailSelector } from "../store/reducers/profile";
import SectionStatusComponent from "./SectionStatus";
import { Body } from "./core/typography/Body";
import { H3 } from "./core/typography/H3";
import { ContextualHelpPropsMarkdown } from "./screens/BaseScreenComponent";
import ScreenContent from "./screens/ScreenContent";
import TopScreenComponent from "./screens/TopScreenComponent";

const styles = StyleSheet.create({
  emailWithIcon: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center"
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
  footerProps: ComponentProps<typeof FooterWithButtons>;
};

const EmailReadComponent = ({ handleGoBack, footerProps }: Props) => {
  const optionEmail = useIOSelector(profileEmailSelector);

  return (
    <>
      <TopScreenComponent
        goBack={handleGoBack}
        headerTitle={I18n.t("profile.data.list.email")}
        contextualHelpMarkdown={contextualHelpMarkdown}
      >
        <ScreenContent title={I18n.t("email.read.title")}>
          <ContentWrapper>
            <Body>{I18n.t("email.insert.label")}</Body>
            <VSpacer size={8} />
            <View style={styles.emailWithIcon}>
              <View style={styles.icon}>
                <Icon
                  name="email"
                  accessible={true}
                  accessibilityLabel={I18n.t("email.read.title")}
                  size={24}
                />
              </View>
              {O.isSome(optionEmail) && <H3>{optionEmail.value}</H3>}
            </View>
            <VSpacer size={24} />
            <Body color="bluegrey">{`${I18n.t("email.read.details")}`}</Body>
          </ContentWrapper>
        </ScreenContent>
        <SectionStatusComponent sectionKey={"email_validation"} />
      </TopScreenComponent>
      <FooterWithButtons {...footerProps} />
    </>
  );
};

export default EmailReadComponent;
