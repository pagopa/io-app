import { useActor } from "@xstate/react";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { View as NBView } from "native-base";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, StyleSheet } from "react-native";
import { H1 } from "../../../../components/core/typography/H1";
import { Body } from "../../../../components/core/typography/Body";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import Markdown from "../../../../components/ui/Markdown";
import I18n from "../../../../i18n";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { useOnboardingMachineService } from "../xstate/provider";
import ButtonExtendedOutline from "../../../../components/ui/ButtonExtendedOutline";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.main.contextualHelpTitle",
  body: "profile.main.contextualHelpContent"
};

const title = I18n.t("idpay.onboarding.PDNDPrerequisites.title");
const headerString = I18n.t("idpay.onboarding.navigation.header");

const secondaryButtonProps = {
  block: true,
  bordered: true,
  title: I18n.t("global.buttons.back")
};
const primaryButtonProps = {
  block: true,
  bordered: false,
  title: I18n.t("global.buttons.continue")
};

const subtitle = (service: string) =>
  I18n.t("idpay.onboarding.PDNDPrerequisites.subtitle", {
    service
  });

const styles = StyleSheet.create({
  listContainer: {
    marginTop: 24
  }
});

const BOTTOM_SHEET_HEIGHT = 290;

export const PDNDPrerequisitesScreen = () => {
  const machine = useOnboardingMachineService();
  const [state, send] = useActor(machine);
  const [authority, setAuthority] = React.useState<string | undefined>();

  const continueOnPress = () => send({ type: "ACCEPT_REQUIRED_PDND_CRITERIA" });
  const goBackOnPress = () => send({ type: "GO_BACK" });

  const { present, bottomSheet, dismiss } = useIOBottomSheetModal(
    <Markdown>
      {I18n.t("idpay.onboarding.PDNDPrerequisites.prerequisites.info.body", {
        provider: authority
      })}
    </Markdown>,
    I18n.t("idpay.onboarding.PDNDPrerequisites.prerequisites.info.header"),
    BOTTOM_SHEET_HEIGHT,

    <FooterWithButtons
      type="SingleButton"
      leftButton={{
        onPress: () => dismiss(),
        block: true,
        bordered: false,
        title: I18n.t(
          "idpay.onboarding.PDNDPrerequisites.prerequisites.info.understoodCTA"
        )
      }}
    ></FooterWithButtons>
  );

  const pdndCriteria = pipe(
    state.context.requiredCriteria,
    O.fromNullable,
    O.flatten,
    O.fold(
      () => [],
      _ => _.pdndCriteria
    )
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <BaseScreenComponent
        goBack={goBackOnPress}
        headerTitle={headerString}
        contextualHelpMarkdown={contextualHelpMarkdown}
      >
        <ScrollView>
          <View style={IOStyles.horizontalContentPadding}>
            <NBView spacer={true} />
            <H1>{title}</H1>
            <NBView spacer />
            <Body>{subtitle("18App")}</Body>
            {/* will get service name from store */}
          </View>
          <View
            style={[IOStyles.horizontalContentPadding, styles.listContainer]}
          >
            {pdndCriteria.map((requisite, index) => (
              <React.Fragment key={index}>
                <ButtonExtendedOutline
                  label={requisite.code}
                  description={requisite.description}
                  onPress={() => {
                    setAuthority(requisite.authority);
                    present();
                  }}
                />
              </React.Fragment>
            ))}
          </View>
        </ScrollView>
      </BaseScreenComponent>
      <FooterWithButtons
        type="TwoButtonsInlineHalf"
        leftButton={{ onPress: goBackOnPress, ...secondaryButtonProps }}
        rightButton={{ onPress: continueOnPress, ...primaryButtonProps }}
      />
      {bottomSheet}
    </SafeAreaView>
  );
};

export default PDNDPrerequisitesScreen;
