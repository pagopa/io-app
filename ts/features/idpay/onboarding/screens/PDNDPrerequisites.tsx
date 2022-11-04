import { List, Text, View } from "native-base";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { PDNDCriteriaDTO } from "../../../../../definitions/idpay/onboarding/PDNDCriteriaDTO";
import { H1 } from "../../../../components/core/typography/H1";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { ContextualHelpPropsMarkdown } from "../../../../components/screens/BaseScreenComponent";
import TopScreenComponent from "../../../../components/screens/TopScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import Markdown from "../../../../components/ui/Markdown";
import TypedI18n from "../../../../i18n";

// TODO:: REMOVE MOCKS -- everything under this has to be changed

// will be needed when implementing the info buttons
const understoodCTAtext = TypedI18n.t(
  "idpay.onboarding.PDNDPrerequisites.prerequisites.info.understoodCTA"
);
const requisiteInfoHeader = TypedI18n.t(
  "idpay.onboarding.PDNDPrerequisites.prerequisites.info.header"
);
const subtitle = (service: string) =>
  TypedI18n.t("idpay.onboarding.PDNDPrerequisites.subtitle", {
    service
  }); // get SERVICE from store;

const requisiteInfoBody = (provider: string) =>
  TypedI18n.t("idpay.onboarding.PDNDPrerequisites.prerequisites.info.body", {
    provider
  }); // TODO:: will be shown when prereuqisite is clicked get PROVIDER from store;
const continueOnPress = () => console.log("PDNDAcceptanceScreen"); // should be custom
const cancelOnPress = () => console.log("PDNDAcceptanceScreen"); // should be custom

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  // needs an actual contextual help, needs original i18n
  title: "profile.main.contextualHelpTitle",
  body: "profile.main.contextualHelpContent"
};

const prerequisiteList: Prerequisites = [
  {
    code: "1",
    authority: "Lorem ipsum",
    description: `**Data di nascita**  
    2003`
  },
  {
    code: "2",
    authority: "Lorem ipsum",
    description: ` **Residenza**  
    Italia`
  },
  {
    code: "3",
    authority: "Lorem ipsum",
    description: `**Data di nascita**  
     2003`
  }
]; // fetched from state/backend

type PageProps = {
  // needs full implementation
  prerequites: Prerequisites;
};

// TODO:: END OF MOCKS

type Prerequisite = PDNDCriteriaDTO;
type Prerequisites = Array<Prerequisite>;

const title = TypedI18n.t("idpay.onboarding.PDNDPrerequisites.title");
const headerString = TypedI18n.t("idpay.onboarding.navigation.header");

const secondaryButtonProps = {
  block: true,
  bordered: true,
  onPress: cancelOnPress,
  title: TypedI18n.t("global.buttons.cancel")
};
const primaryButtonProps = {
  block: true,
  bordered: false,
  onPress: continueOnPress,
  title: TypedI18n.t("global.buttons.continue")
};

//  statex's alternative of mapStateToProps?
export const PDNDPrerequisites = (props: PageProps) => (
  <SafeAreaView style={{ flex: 1 }}>
    <TopScreenComponent
      goBack={true}
      headerTitle={headerString}
      contextualHelpMarkdown={contextualHelpMarkdown}
      // faqCategories={[]}
    >
      <View style={IOStyles.horizontalContentPadding}>
        <View spacer={true} />
        <H1>{title}</H1>
        <View spacer />
        <Text>{subtitle("18App")}</Text>
        {/* will get service name from store */}
        <View large spacer />
      </View>

      <List withContentLateralPadding>
        {prerequisiteList.map((requisite, index) => (
          <Markdown key={index}>{requisite.description}</Markdown>
        ))}
      </List>
    </TopScreenComponent>
    <FooterWithButtons
      type="TwoButtonsInlineHalf"
      leftButton={secondaryButtonProps}
      rightButton={primaryButtonProps}
      // will use custom generator state-based function to derive from state (see '../screens/wallet/AddCardScreen.tsx' line 126 & 482)
    />
  </SafeAreaView>
);
