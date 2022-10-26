import { List, Text } from "native-base";
import React from "react";
import { SafeAreaView } from "react-native";
import { ContextualHelpPropsMarkdown } from "../../../components/screens/BaseScreenComponent";
import ScreenContent from "../../../components/screens/ScreenContent";
import TopScreenComponent from "../../../components/screens/TopScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import TypedI18n from "../../../i18n";

// TODO:: REMOVE MOCKS

const title = "Possiedi I seguenti requisiti?"; // should be in i18n
const subtitle =
  "Verificheremo con alcuni Enti se hai i requisiti per accedere al servizio"; // should be in i18n
const headerString = "Adesione all'Iniziativa"; // should be in i18n
const onPress = () => console.log("PDNDAcceptanceScreen"); // should be custom

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.main.contextualHelpTitle",
  body: "profile.main.contextualHelpContent"
};
type i18nString = ReturnType<TypedI18n["t"]>;
type Prerequisite = string;
type Prerequisites = Array<Prerequisite>;

const requisiteList: Prerequisites = [
  "requisito 1",
  "requisito2",
  "requisito3",
  "requisito5"
];

// TODO:: END OF MOCKS

type ButtonProps = {
  block: boolean;
  bordered: boolean;
  onPress: () => void;
  title: i18nString; // This or bare string?
};

const secondaryButtonProps: ButtonProps = {
  block: true,
  bordered: true,
  onPress,
  title: TypedI18n.t("global.buttons.cancel")
};
const primaryButtonProps: ButtonProps = {
  block: true,
  bordered: false,
  onPress,
  title: TypedI18n.t("global.buttons.continue")
};

type PageProps = {
  prerequites: Prerequisites;
};

export const PDNDAcceptanceScreen: React.FC<PageProps> = ({
  prerequisites
}) => (
  <SafeAreaView style={{ flex: 1 }}>
    <TopScreenComponent
      goBack={true}
      headerTitle={headerString}
      contextualHelpMarkdown={contextualHelpMarkdown}
    >
      <ScreenContent title={title} subtitle={subtitle}>
        <List withContentLateralPadding>
          {requisiteList.map((requisite, index) => (
            <Text key={index}>{requisite}</Text>
          ))}
        </List>
      </ScreenContent>
    </TopScreenComponent>
    <FooterWithButtons
      type="TwoButtonsInlineHalf"
      leftButton={secondaryButtonProps}
      rightButton={primaryButtonProps}
    />
  </SafeAreaView>
);
