import { CodeEnum } from "@io-app/api-types/generated/definitions/idpay/AutomatedCriteriaDTO";
import { FamilyUnitCompositionEnum } from "@io-app/api-types/generated/definitions/idpay/InitiativeGeneralDTO";
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
  familyUnitCompositionCriteriaSelector,
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

const getFamilyUnitCompositionCopy = (
  familyUnitComposition: FamilyUnitCompositionEnum
): { description: string; title: string } => {
  switch (familyUnitComposition) {
    case FamilyUnitCompositionEnum.ANPR:
      return {
        title: I18n.t(
          "idpay.onboarding.PDNDPrerequisites.familyUnitCode.ANPR.title"
        ),
        description: I18n.t(
          "idpay.onboarding.PDNDPrerequisites.familyUnitCode.ANPR.description"
        )
      };
    case FamilyUnitCompositionEnum.INPS:
      return {
        title: I18n.t(
          "idpay.onboarding.PDNDPrerequisites.familyUnitCode.INPS.title"
        ),
        description: I18n.t(
          "idpay.onboarding.PDNDPrerequisites.familyUnitCode.INPS.description"
        )
      };
  }
};

const IdPayPDNDPrerequisitesScreen = () => {
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

  const { present, bottomSheet } = useIOBottomSheetModal({
    title: I18n.t(
      "idpay.onboarding.PDNDPrerequisites.prerequisites.info.header"
    ),
    component: (
      <>
        <IOMarkdownLite
          content={I18n.t(
            "idpay.onboarding.PDNDPrerequisites.prerequisites.info.body",
            {
              provider: authority
            }
          )}
        />
        <VSpacer size={24} />
      </>
    )
  });

  const pdndCriteria = useSelector(pdndCriteriaSelector);
  const familyUnitCriteria = useSelector(familyUnitCompositionCriteriaSelector);
  const familyUnitCopy =
    familyUnitCriteria !== undefined
      ? getFamilyUnitCompositionCopy(familyUnitCriteria)
      : undefined;

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
              onPress={() => {
                setAuthority(criteria.authority);
                present();
              }}
            />
          )}
          <VSpacer size={16} />
        </Fragment>
      ))}
      {familyUnitCopy && (
        <>
          <ModuleSummary
            description={familyUnitCopy.description}
            label={familyUnitCopy.title}
            onPress={() => {
              setAuthority(familyUnitCopy.description);
              present();
            }}
          />
          <VSpacer size={16} />
        </>
      )}
      {bottomSheet}
    </IOScrollViewWithLargeHeader>
  );
};

export default IdPayPDNDPrerequisitesScreen;
