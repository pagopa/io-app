import {
  ButtonSolid,
  ContentWrapper,
  ModuleSummary,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import LegacyMarkdown from "../../../../components/ui/Markdown/LegacyMarkdown";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { serviceByIdPotSelector } from "../../../services/details/store/reducers";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import { pdndCriteriaSelector, selectServiceId } from "../machine/selectors";
import { getPDNDCriteriaDescription } from "../utils/strings";

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

  const { present, bottomSheet, dismiss } = useIOBottomSheetAutoresizableModal(
    {
      title: I18n.t(
        "idpay.onboarding.PDNDPrerequisites.prerequisites.info.header"
      ),
      component: (
        <LegacyMarkdown>
          {I18n.t(
            "idpay.onboarding.PDNDPrerequisites.prerequisites.info.body",
            {
              provider: authority
            }
          )}
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
    },
    162
  );

  const pdndCriteria = useSelector(pdndCriteriaSelector);

  return (
    <IOScrollViewWithLargeHeader
      includeContentMargins
      title={{
        label: I18n.t("idpay.onboarding.PDNDPrerequisites.title"),
        section: I18n.t("idpay.onboarding.navigation.header")
      }}
      description={I18n.t("idpay.onboarding.PDNDPrerequisites.subtitle", {
        service: serviceName
      })}
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t("global.buttons.continue"),
          onPress: continueOnPress
        }
      }}
      goBack={goBackOnPress}
      contextualHelp={emptyContextualHelp}
      headerActionsProp={{ showHelp: true }}
    >
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
      {bottomSheet}
    </IOScrollViewWithLargeHeader>
  );
};

export default PDNDPrerequisitesScreen;
