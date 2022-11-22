import { useActor } from "@xstate/react";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { List, Text, View } from "native-base";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";
import { H1 } from "../../../../components/core/typography/H1";
import { H4 } from "../../../../components/core/typography/H4";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import Markdown from "../../../../components/ui/Markdown";
import TypedI18n from "../../../../i18n";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
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
  const [authority, setAuthority] = React.useState<string | undefined>();

  const continueOnPress = () => send({ type: "ACCEPT_REQUIRED_PDND_CRITERIA" });

  const { present, bottomSheet, dismiss } = useIOBottomSheetModal(
    <Markdown>
      {TypedI18n.t(
        "idpay.onboarding.PDNDPrerequisites.prerequisites.info.body",
        { provider: authority }
      )}
    </Markdown>,
    TypedI18n.t("idpay.onboarding.PDNDPrerequisites.prerequisites.info.header"),
    290,

    <FooterWithButtons
      type="SingleButton"
      leftButton={{
        onPress: () => dismiss(),
        block: true,
        bordered: false,
        title: TypedI18n.t(
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
              <ButtonDefaultOpacity
                bordered={true}
                onPress={() => {
                  setAuthority(requisite.authority);
                  present();
                }}
              >
                <H4>{requisite.code}</H4>
                <LabelSmall weight="Regular" color="bluegreyDark">
                  {requisite.description}
                </LabelSmall>
              </ButtonDefaultOpacity>
              <View spacer={true} />
            </React.Fragment>
          ))}
        </List>
      </BaseScreenComponent>
      <FooterWithButtons
        type="TwoButtonsInlineHalf"
        leftButton={secondaryButtonProps}
        rightButton={{ onPress: continueOnPress, ...primaryButtonProps }}
      />
      {bottomSheet}
    </SafeAreaView>
  );
};
