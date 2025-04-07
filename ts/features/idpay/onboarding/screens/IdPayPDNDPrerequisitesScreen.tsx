import {
  FooterActions,
  ModuleSummary,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { Fragment, useState } from "react";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import IOMarkdown from "../../../../components/IOMarkdown";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { serviceByIdPotSelector } from "../../../services/details/store/reducers";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import { pdndCriteriaSelector, selectServiceId } from "../machine/selectors";
import { getPDNDCriteriaDescription } from "../utils/strings";

export const IdPayPDNDPrerequisitesScreen = () => {
  const { useActorRef, useSelector } = IdPayOnboardingMachineContext;
  const machine = useActorRef();

  const [authority, setAuthority] = useState<string | undefined>();
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
        <IOMarkdown
          content={I18n.t(
            "idpay.onboarding.PDNDPrerequisites.prerequisites.info.body",
            {
              provider: authority
            }
          )}
        />
      ),
      footer: (
        <FooterActions
          actions={{
            primary: {
              label: I18n.t(
                "idpay.onboarding.PDNDPrerequisites.prerequisites.info.understoodCTA"
              ),
              onPress: () => dismiss()
            },
            type: "SingleButton"
          }}
        />
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
        <Fragment key={index}>
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
        </Fragment>
      ))}
      {bottomSheet}
    </IOScrollViewWithLargeHeader>
  );
};

export default IdPayPDNDPrerequisitesScreen;
