import { useActor } from "@xstate/react";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { List, Text, View } from "native-base";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { H1 } from "../../../../components/core/typography/H1";
import { H4 } from "../../../../components/core/typography/H4";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { ContextualHelpPropsMarkdown } from "../../../../components/screens/BaseScreenComponent";
import TopScreenComponent from "../../../../components/screens/TopScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import TypedI18n from "../../../../i18n";
import { useOnboardingMachineService } from "../xstate/provider";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.main.contextualHelpTitle",
  body: "profile.main.contextualHelpContent"
};

const title = TypedI18n.t("idpay.onboarding.PDNDPrerequisites.title");
const headerString = TypedI18n.t("idpay.onboarding.navigation.header");

const secondaryButtonProps = {
  block: true,
  bordered: true,
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
  });

export const PDNDPrerequisites = () => {
  const machine = useOnboardingMachineService();
  const [state, send] = useActor(machine);

  const continueOnPress = () => send({ type: "ACCEPT_REQUIRED_PDND_CRITERIA" });

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
      <TopScreenComponent
        goBack={true}
        headerTitle={headerString}
        contextualHelpMarkdown={contextualHelpMarkdown}
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
          {pdndCriteria.map((requisite, index) => (
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
      />
    </SafeAreaView>
  );
};
