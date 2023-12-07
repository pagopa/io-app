import * as pot from "@pagopa/ts-commons/lib/pot";
import { useSelector } from "@xstate/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ButtonSolid,
  VSpacer,
  ContentWrapper,
  ButtonExtendedOutline
} from "@pagopa/io-app-design-system";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { Body } from "../../../../components/core/typography/Body";
import { H1 } from "../../../../components/core/typography/H1";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import Markdown from "../../../../components/ui/Markdown";
import { useNavigationSwipeBackListener } from "../../../../hooks/useNavigationSwipeBackListener";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { serviceByIdSelector } from "../../../../store/reducers/entities/services/servicesById";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { getPDNDCriteriaDescription } from "../utils/strings";
import { useOnboardingMachineService } from "../xstate/provider";
import { pdndCriteriaSelector, selectServiceId } from "../xstate/selectors";

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

const styles = StyleSheet.create({
  listContainer: {
    marginTop: 24
  }
});

export const PDNDPrerequisitesScreen = () => {
  const machine = useOnboardingMachineService();
  const [authority, setAuthority] = React.useState<string | undefined>();
  const serviceId = useSelector(machine, selectServiceId);

  const serviceName = pipe(
    useIOSelector(state => serviceByIdSelector(state, serviceId as ServiceId)),
    pot.toOption,
    O.fold(
      () => I18n.t("idpay.onboarding.PDNDPrerequisites.fallbackInitiativeName"),
      service => service.service_name
    )
  );

  const continueOnPress = () =>
    machine.send({ type: "ACCEPT_REQUIRED_PDND_CRITERIA" });
  const goBackOnPress = () => machine.send({ type: "BACK" });

  const { present, bottomSheet, dismiss } = useIOBottomSheetAutoresizableModal(
    {
      title: I18n.t(
        "idpay.onboarding.PDNDPrerequisites.prerequisites.info.header"
      ),
      component: (
        <Markdown>
          {I18n.t(
            "idpay.onboarding.PDNDPrerequisites.prerequisites.info.body",
            {
              provider: authority
            }
          )}
        </Markdown>
      ),
      footer: (
        <ContentWrapper>
          <VSpacer size={16} />
          <ButtonSolid
            fullWidth
            label={I18n.t(
              "idpay.onboarding.PDNDPrerequisites.prerequisites.info.understoodCTA"
            )}
            accessibilityLabel={I18n.t(
              "idpay.onboarding.PDNDPrerequisites.prerequisites.info.understoodCTA"
            )}
            onPress={() => dismiss()}
          />
          <VSpacer size={16} />
        </ContentWrapper>
      )
    },
    162
  );

  const pdndCriteria = useSelector(machine, pdndCriteriaSelector);

  useNavigationSwipeBackListener(() => {
    machine.send({ type: "BACK", skipNavigation: true });
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <BaseScreenComponent
        goBack={goBackOnPress}
        headerTitle={I18n.t("idpay.onboarding.navigation.header")}
        contextualHelp={emptyContextualHelp}
      >
        <ScrollView>
          <View style={IOStyles.horizontalContentPadding}>
            <VSpacer size={16} />
            <H1>{I18n.t("idpay.onboarding.PDNDPrerequisites.title")}</H1>
            <VSpacer size={16} />
            <Body>
              {I18n.t("idpay.onboarding.PDNDPrerequisites.subtitle", {
                service: serviceName
              })}
            </Body>
          </View>
          <View
            style={[IOStyles.horizontalContentPadding, styles.listContainer]}
          >
            {pdndCriteria.map((criteria, index) => (
              <React.Fragment key={index}>
                <ButtonExtendedOutline
                  label={I18n.t(
                    `idpay.onboarding.PDNDPrerequisites.code.${criteria.code}`
                  )}
                  description={getPDNDCriteriaDescription(criteria)}
                  onPress={() => {
                    setAuthority(criteria.authority);
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
