import { List, Text } from "native-base";
import React from "react";
import { SafeAreaView } from "react-native";
import { ContextualHelpPropsMarkdown } from "../../../components/screens/BaseScreenComponent";
import ScreenContent from "../../../components/screens/ScreenContent";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import TypedI18n from "../../../i18n";

// TODO:: REMOVE MOCKS -- everything under this has to be changed

// will be needed when implementing the info buttons
const understoodCTAtext = TypedI18n.t(
  "idpay.pdndAcceptance.requisites.info.understoodCTA"
);
const requisiteInfoHeader = TypedI18n.t(
  "idpay.pdndAcceptance.requisites.info.header"
);
const subtitle = TypedI18n.t('idpay.pdndAcceptance.subtitle',{service:'18App'}); // get SERVICE from store;

const requisiteInfoBody=TypedI18n.t('idpay.pdndAcceptance.requisites.info.body',{provider:'Lorem'});// get PROVIDER from store;
const continueOnPress = () => console.log("PDNDAcceptanceScreen"); // should be custom
const cancelOnPress = () => console.log("PDNDAcceptanceScreen"); // should be custom

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  // needs an actual contextual help, needs original i18n
  title: "profile.main.contextualHelpTitle",
  body: "profile.main.contextualHelpContent"
};

type Prerequisite = string; // most likely will be an obj
type Prerequisites = Array<Prerequisite>; // or is it just an array?

const prerequisiteList: Prerequisites = [
  // fetched from state/backend
  "requisito 1",
  "requisito2",
  "requisito3",
  "requisito5"
];

type PageProps = {
  // needs full implementation
  prerequites: Prerequisites;
};

// TODO:: END OF MOCKS

const title = TypedI18n.t("idpay.pdndAcceptance.title");
const headerString = TypedI18n.t("idpay.navigation.header");

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
export const PDNDAcceptanceScreen: React.FC<PageProps> = ({ prerequisites }) => (
  <SafeAreaView style={{ flex: 1 }}>
    <TopScreenComponent
      goBack={true}
      headerTitle={headerString}
      contextualHelpMarkdown={contextualHelpMarkdown}
    >
      <ScreenContent
        title={title}
        // fontSize is 28 here, the component described in the figma is 26
        subtitle={subtitle}
      >
        <List withContentLateralPadding>
          {prerequisiteList.map((requisite, index) => (
            <Text key={index}>{requisite}</Text>
          ))}
        </List>
      </ScreenContent>
    </TopScreenComponent>
    <FooterWithButtons
      type="TwoButtonsInlineHalf"
      leftButton={secondaryButtonProps}
      rightButton={primaryButtonProps}
      // will use custom generator state-based function to derive from state (see '../screens/wallet/AddCardScreen.tsx' line 126 & 482)
    />
  </SafeAreaView>
);
