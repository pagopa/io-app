import I18n from "i18next";
import { FunctionComponent, useCallback } from "react";

import { useHardwareBackButton } from "../../../../../hooks/useHardwareBackButton";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { emptyContextualHelp } from "../../../../../utils/contextualHelp";
import BonusInformationComponent from "../../../common/components/BonusInformationComponent";
import { availableBonusTypesSelectorFromId } from "../../../common/store/selectors";
import { ID_CGN_TYPE } from "../../../common/utils";
import {
  cgnActivationBack,
  cgnActivationCancel,
  cgnRequestActivation
} from "../../store/actions/activation";

/**
 * This Screen shows all the information about the cgn program, with the rules
 * and t&c.
 */
const CgnInformationScreen: FunctionComponent = () => {
  const dispatch = useIODispatch();
  const bonus = useIOSelector(availableBonusTypesSelectorFromId(ID_CGN_TYPE));

  const onConfirm = useCallback(() => {
    dispatch(cgnRequestActivation());
  }, [dispatch]);

  const onBack = useCallback(() => {
    dispatch(cgnActivationBack());
  }, [dispatch]);

  const onCancel = useCallback(() => {
    dispatch(cgnActivationCancel());
  }, [dispatch]);

  useHardwareBackButton(() => {
    onBack();
    return true;
  });

  return (
    <>
      {bonus ? (
        <BonusInformationComponent
          bonus={bonus}
          contextualHelp={emptyContextualHelp}
          onBack={onBack}
          onCancel={onCancel}
          onConfirm={onConfirm}
          primaryCtaText={I18n.t("bonus.cgn.cta.activeBonus")}
          secondaryAction={{ type: "back", text: I18n.t("bonus.cgn.cta.back") }}
        />
      ) : null}
    </>
  );
};

export default CgnInformationScreen;
