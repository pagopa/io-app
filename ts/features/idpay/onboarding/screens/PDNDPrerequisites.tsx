import { useActor } from "@xstate/react";
import { List, Text, View } from "native-base";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { PDNDCriteriaDTO } from "../../../../../definitions/idpay/onboarding/PDNDCriteriaDTO";
import { H1 } from "../../../../components/core/typography/H1";
import { H4 } from "../../../../components/core/typography/H4";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
// import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { ContextualHelpPropsMarkdown } from "../../../../components/screens/BaseScreenComponent";
import TopScreenComponent from "../../../../components/screens/TopScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import TypedI18n from "../../../../i18n";
import { useOnboardingMachineService } from "../xstate/provider";

// will be needed when implementing the info buttons
const understoodCTAtext = TypedI18n.t(
  "idpay.onboarding.PDNDPrerequisites.prerequisites.info.understoodCTA"
);
const requisiteInfoHeader = TypedI18n.t(
  "idpay.onboarding.PDNDPrerequisites.prerequisites.info.header"
);
// TODO:: REMOVE MOCKS -- everything under this has to be changed
const cancelOnPress = () => console.log("PDNDAcceptanceScreen"); // should be custom

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  // needs an actual contextual help, needs original i18n
  title: "profile.main.contextualHelpTitle",
  body: "profile.main.contextualHelpContent"
};

const prerequisiteList: Prerequisites = [
  {
    code: "BIRTHNAME",
    authority: "Lorem ipsum",
    description: "Mario Rossi"
  },
  {
    code: "BIRTHDATE",
    authority: "Lorem ipsum",
    description: "2001"
  },
  {
    code: "RESIDENZA",
    authority: "Lorem ipsum",
    description: "Italiana"
  }
]; // fetched from state/backend

// displaying_required_pdnd_criteria
//

export type PDNDPrerequisitesRouteParams = {
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
  title: TypedI18n.t("global.buttons.continue")
};

const subtitle = (service: string) =>
  TypedI18n.t("idpay.onboarding.PDNDPrerequisites.subtitle", {
    service
  }); // get SERVICE from store;

const requisiteInfoBody = (provider: string) =>
  TypedI18n.t("idpay.onboarding.PDNDPrerequisites.prerequisites.info.body", {
    provider
  });

export const PDNDPrerequisites = (props: PDNDPrerequisitesRouteParams) => {
  const machine = useOnboardingMachineService();
  const [state, send] = useActor(machine);

  const continueOnPress = () => send({ type: "ACCEPT_REQUIRED_PDND_CRITERIA" });

  const prerequisites: Prerequisites = prerequisiteList;

  return (
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
          {prerequisites.map((requisite, index) => (
            <React.Fragment key={index}>
              <H4>{requisite.code}</H4>
              <LabelSmall weight="Regular" color="bluegreyDark">
                {requisite.description}
              </LabelSmall>
              <View spacer={true} />
            </React.Fragment>
          ))}
          <Text>{state.value}</Text>
          <Text>{JSON.stringify(state.context)}</Text>
        </List>
      </TopScreenComponent>
      <FooterWithButtons
        type="TwoButtonsInlineHalf"
        leftButton={secondaryButtonProps}
        rightButton={{ onPress: continueOnPress, ...primaryButtonProps }}
        // will use custom generator state-based function to derive from state (see '../screens/wallet/AddCardScreen.tsx' line 126 & 482)
      />
    </SafeAreaView>
  );
};
