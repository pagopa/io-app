import {
  FooterActions,
  ModuleSummary,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { Fragment, useState } from "react";
import IOMarkdown from "../../../../components/IOMarkdown";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import IdPayOnboardingStepper from "../components/IdPayOnboardingStepper";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import { pdndCriteriaSelector, selectInitiative } from "../machine/selectors";
import { getPDNDCriteriaDescription } from "../utils/strings";

export const IdPayPDNDPrerequisitesScreen = () => {
  const { useActorRef, useSelector } = IdPayOnboardingMachineContext;
  const machine = useActorRef();

  const [authority, setAuthority] = useState<string | undefined>();

  const initiative = useSelector(selectInitiative);

  const initiativeName = pipe(
    initiative,
    O.map(i => i.initiativeName),
    O.toUndefined
  );

  const continueOnPress = () => machine.send({ type: "next" });
  const goBackOnPress = () => machine.send({ type: "back" });

  const { present, bottomSheet, dismiss } = useIOBottomSheetModal({
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
  });

  const pdndCriteria = useSelector(pdndCriteriaSelector);

  return (
    <IOScrollViewWithLargeHeader
      topElement={<IdPayOnboardingStepper />}
      includeContentMargins
      title={{
        label: I18n.t("idpay.onboarding.PDNDPrerequisites.title"),
        section: I18n.t("idpay.onboarding.navigation.header")
      }}
      description={I18n.t("idpay.onboarding.PDNDPrerequisites.subtitle", {
        service: initiativeName
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
      {pdndCriteria?.map((criteria, index) => (
        <Fragment key={index}>
          {criteria.code && (
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
          )}
          <VSpacer size={16} />
        </Fragment>
      ))}
      {bottomSheet}
    </IOScrollViewWithLargeHeader>
  );
};

export default IdPayPDNDPrerequisitesScreen;
