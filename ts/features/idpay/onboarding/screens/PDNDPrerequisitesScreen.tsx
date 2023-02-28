import * as pot from "@pagopa/ts-commons/lib/pot";
import { useSelector } from "@xstate/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { Body } from "../../../../components/core/typography/Body";
import { H1 } from "../../../../components/core/typography/H1";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../../components/screens/BaseScreenComponent";
import ButtonExtendedOutline from "../../../../components/ui/ButtonExtendedOutline";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import Markdown from "../../../../components/ui/Markdown";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { serviceByIdSelector } from "../../../../store/reducers/entities/services/servicesById";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { useOnboardingMachineService } from "../xstate/provider";
import { pdndCriteriaSelector, selectServiceId } from "../xstate/selectors";

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
  const [authority, setAuthority] = React.useState<string | undefined>();
  const serviceId = useSelector(machine, selectServiceId);

  const serviceName = pipe(
    pot.toOption(
      useIOSelector(serviceByIdSelector(serviceId as ServiceId)) || pot.none
    ),
    O.fold(
      () => I18n.t("idpay.onboarding.PDNDPrerequisites.fallbackInitiativeName"),
      service => service.service_name
    )
  );

  const continueOnPress = () =>
    machine.send({ type: "ACCEPT_REQUIRED_PDND_CRITERIA" });
  const goBackOnPress = () => machine.send({ type: "GO_BACK" });

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

  const pdndCriteria = useSelector(machine, pdndCriteriaSelector);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <BaseScreenComponent
        goBack={goBackOnPress}
        headerTitle={headerString}
        contextualHelpMarkdown={contextualHelpMarkdown}
      >
        <ScrollView>
          <View style={IOStyles.horizontalContentPadding}>
            <VSpacer size={16} />
            <H1>{title}</H1>
            <VSpacer size={16} />
            <Body>{subtitle(serviceName)}</Body>
          </View>
          <View
            style={[IOStyles.horizontalContentPadding, styles.listContainer]}
          >
            {pdndCriteria.map((requisite, index) => (
              <React.Fragment key={index}>
                <ButtonExtendedOutline
                  label={requisite.description}
                  description={requisite.value}
                  onPress={() => {
                    setAuthority(requisite.authority);
                    present();
                  }}
                />
                <VSpacer size={16} />
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
