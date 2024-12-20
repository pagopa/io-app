import {
  Body,
  ButtonSolid,
  ContentWrapper,
  FooterActionsInline,
  H2,
  ModuleSummary,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import LegacyMarkdown from "../../../../components/ui/Markdown/LegacyMarkdown";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { serviceByIdPotSelector } from "../../../services/details/store/reducers";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import { pdndCriteriaSelector, selectServiceId } from "../machine/selectors";
import { getPDNDCriteriaDescription } from "../utils/strings";

const styles = StyleSheet.create({
  listContainer: {
    marginTop: 24
  }
});

export const PDNDPrerequisitesScreen = () => {
  const { useActorRef, useSelector } = IdPayOnboardingMachineContext;
  const machine = useActorRef();

  const [authority, setAuthority] = React.useState<string | undefined>();
  const serviceId = useSelector(selectServiceId);

  const serviceName = pipe(
    useIOSelector(state =>
      serviceByIdPotSelector(state, serviceId as ServiceId)
    ),
    pot.toOption,
    O.fold(
      () => I18n.t("idpay.onboarding.PDNDPrerequisites.fallbackInitiativeName"),
      service => service.service_name
    )
  );

  const continueOnPress = () => machine.send({ type: "next" });
  const goBackOnPress = () => machine.send({ type: "back" });

  const { present, bottomSheet, dismiss } = useIOBottomSheetModal({
    title: I18n.t(
      "idpay.onboarding.PDNDPrerequisites.prerequisites.info.header"
    ),
    component: (
      <LegacyMarkdown>
        {I18n.t("idpay.onboarding.PDNDPrerequisites.prerequisites.info.body", {
          provider: authority
        })}
      </LegacyMarkdown>
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
  });

  const pdndCriteria = useSelector(pdndCriteriaSelector);

  useHeaderSecondLevel({
    title: I18n.t("idpay.onboarding.navigation.header"),
    contextualHelp: emptyContextualHelp,
    goBack: goBackOnPress,
    supportRequest: true
  });

  return (
    <>
      <ScrollView>
        <View style={IOStyles.horizontalContentPadding}>
          <VSpacer size={16} />
          <H2>{I18n.t("idpay.onboarding.PDNDPrerequisites.title")}</H2>
          <VSpacer size={16} />
          <Body>
            {I18n.t("idpay.onboarding.PDNDPrerequisites.subtitle", {
              service: serviceName
            })}
          </Body>
        </View>
        <View style={[IOStyles.horizontalContentPadding, styles.listContainer]}>
          {pdndCriteria.map((criteria, index) => (
            <React.Fragment key={index}>
              <ModuleSummary
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
      <FooterActionsInline
        startAction={{
          color: "primary",
          label: I18n.t("global.buttons.back"),
          onPress: goBackOnPress
        }}
        endAction={{
          color: "primary",
          label: I18n.t("global.buttons.continue"),
          onPress: continueOnPress
        }}
      />
      {bottomSheet}
    </>
  );
};

export default PDNDPrerequisitesScreen;
