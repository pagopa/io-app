import { CodeEnum } from "@io-app/api-types/generated/definitions/idpay/AutomatedCriteriaDTO";
import { IOMarkdownLite, ModuleSummary, VSpacer } from "@io-app/design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { Fragment, useState } from "react";

import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { trackIDPayOnboardingPDNDAcceptance } from "../analytics";
import IdPayOnboardingStepper from "../components/IdPayOnboardingStepper";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import {
  informativeCriteriaSelector,
  pdndCriteriaSelector,
  selectInitiative
} from "../machine/selectors";
import { getPDNDCriteriaDescription } from "../utils/strings";

const getPDNDCriteriaCodeLabel = (code: CodeEnum): string => {
  switch (code) {
    case CodeEnum.BIRTHDAY:
      return I18n.t("idpay.onboarding.PDNDPrerequisites.code.BIRTHDAY");
    case CodeEnum.FAMILY_UNIT:
      return I18n.t("idpay.onboarding.PDNDPrerequisites.code.FAMILY_UNIT");
    case CodeEnum.ISEE:
      return I18n.t("idpay.onboarding.PDNDPrerequisites.code.ISEE");
    case CodeEnum.RESIDENCE:
      return I18n.t("idpay.onboarding.PDNDPrerequisites.code.RESIDENCE");
  }
};

const IdPayPDNDPrerequisitesScreen = () => {
  const { useActorRef, useSelector } = IdPayOnboardingMachineContext;
  const machine = useActorRef();

  const [authority, setAuthority] = useState<string | undefined>();
  // Holds the free-text "value" of an "informative" self-declaration
  // criteria (BE-provided), shown as-is in the bottom sheet instead of
  // the generic templated body used for automated/PDND criteria.
  const [informativeValue, setInformativeValue] = useState<
    string | undefined
  >();

  const initiative = useSelector(selectInitiative);

  const initiativeName = pipe(
    initiative,
    O.map(i => i.initiativeName),
    O.toUndefined
  );

  const continueOnPress = () => machine.send({ type: "next" });
  const goBackOnPress = () => machine.send({ type: "back" });

  const { present, bottomSheet } = useIOBottomSheetModal({
    title: I18n.t(
      "idpay.onboarding.PDNDPrerequisites.prerequisites.info.header"
    ),
    component: (
      <>
        <IOMarkdownLite
          content={
            informativeValue ??
            I18n.t(
              "idpay.onboarding.PDNDPrerequisites.prerequisites.info.body",
              {
                provider: authority
              }
            )
          }
        />
        <VSpacer size={24} />
      </>
    )
  });

  const openPdndInfoBottomSheet = (criteriaAuthority: string | undefined) => {
    setInformativeValue(undefined);
    setAuthority(criteriaAuthority);
    present();
  };

  const openInformativeBottomSheet = (value: string) => {
    setAuthority(undefined);
    setInformativeValue(value);
    present();
  };

  const pdndCriteria = useSelector(pdndCriteriaSelector);
  const informativeCriteria = useSelector(informativeCriteriaSelector);

  const initiativeId = pipe(
    initiative,
    O.map(i => i.initiativeId),
    O.getOrElse(() => "")
  );

  useOnFirstRender(() =>
    trackIDPayOnboardingPDNDAcceptance({
      initiativeId
    })
  );

  return (
    <IOScrollViewWithLargeHeader
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t("global.buttons.continue"),
          onPress: continueOnPress
        }
      }}
      description={I18n.t("idpay.onboarding.PDNDPrerequisites.subtitle", {
        service: initiativeName
      })}
      goBack={goBackOnPress}
      headerActionsProp={{ showHelp: true }}
      includeContentMargins
      title={{
        label: I18n.t("idpay.onboarding.PDNDPrerequisites.title"),
        section: I18n.t("idpay.onboarding.navigation.header")
      }}
      topElement={<IdPayOnboardingStepper />}
    >
      {pdndCriteria?.map((criteria, index) => (
        <Fragment key={index}>
          {criteria.code && (
            <ModuleSummary
              description={getPDNDCriteriaDescription(criteria)}
              label={getPDNDCriteriaCodeLabel(criteria.code)}
              onPress={() => openPdndInfoBottomSheet(criteria.authority)}
            />
          )}
          <VSpacer size={16} />
        </Fragment>
      ))}
      {informativeCriteria?.map(criteria => (
        <Fragment key={criteria.code}>
          <ModuleSummary
            description={criteria.organization}
            label={criteria.description}
            onPress={() => openInformativeBottomSheet(criteria.value)}
          />
          <VSpacer size={16} />
        </Fragment>
      ))}
      {bottomSheet}
    </IOScrollViewWithLargeHeader>
  );
};

export default IdPayPDNDPrerequisitesScreen;
