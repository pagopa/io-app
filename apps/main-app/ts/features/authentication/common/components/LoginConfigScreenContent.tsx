import {
  ListItemCheckbox,
  ListItemHeader,
  RadioGroup,
  RadioItem,
  VSpacer
} from "@io-app/design-system";
import { useCallback, useMemo } from "react";

import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { CieEntityIds } from "../../login/cie/components/CieRequestAuthenticationOverlay";
import {
  cieLoginDisableUat,
  cieLoginEnableUat
} from "../../login/cie/store/actions";
import { isCieLoginUatEnabledSelector } from "../../login/cie/store/selectors";
import {
  setOneIdentityEnv,
  setOneIdentityLocalFeatureFlag
} from "../store/actions/loginConfig";
import {
  oneIdentityEnvSelector,
  oneIdentityLocalFeatureFlagSelector
} from "../store/selectors/loginConfig";

type OneIdentityLocalFeatureFlag = boolean | undefined;

const LOGIN_FLOW_OPTIONS: ReadonlyArray<
  RadioItem<OneIdentityLocalFeatureFlag>
> = [
  {
    accessibilityLabel: "Usa solo IO",
    id: false,
    value: "Usa solo IO",
    description: "Forza le login in ingresso ad utilizzare lo stack di IO."
  },
  {
    accessibilityLabel: "Usa solo OneIdentity",
    id: true,
    value: "Usa solo OneIdentity",
    description:
      "Forza le login in ingresso ad utilizzare lo stack di OneIdentity."
  },
  {
    accessibilityLabel: "Automatico",
    id: undefined,
    value: "Automatico",
    description:
      "Questo è il normale funzionamento dell'app. Usa questa opzione per l'utilizzo comune."
  }
];

type LoginConfigScreenContentProps = {
  disabled?: boolean;
};

export const LoginConfigScreenContent = ({
  disabled = false
}: LoginConfigScreenContentProps) => {
  const dispatch = useIODispatch();
  const useCieUat = useIOSelector(isCieLoginUatEnabledSelector);
  const oneIdentityLocalFeatureFlag = useIOSelector(
    oneIdentityLocalFeatureFlagSelector
  );
  const oneIdentityEnv = useIOSelector(oneIdentityEnvSelector);

  const radioGroupItems = useMemo(
    () =>
      LOGIN_FLOW_OPTIONS.map(item => ({
        ...item,
        disabled
      })),
    [disabled]
  );

  const handleOneIdentityFlow = useCallback(
    (value: OneIdentityLocalFeatureFlag) => {
      dispatch(setOneIdentityLocalFeatureFlag(value));
    },
    [dispatch]
  );

  const handleOneIdentityEnv = useCallback(
    (isUat: boolean) => {
      dispatch(setOneIdentityEnv(isUat ? "uat" : "prod"));
    },
    [dispatch]
  );

  const handleCieEnv = useCallback(
    (isUat: boolean) => {
      if (isUat) {
        dispatch(cieLoginEnableUat());
      } else {
        dispatch(cieLoginDisableUat());
      }
    },
    [dispatch]
  );

  return (
    <>
      <ListItemHeader label="Login flow" />
      <RadioGroup<OneIdentityLocalFeatureFlag>
        items={radioGroupItems}
        onPress={handleOneIdentityFlow}
        selectedItem={oneIdentityLocalFeatureFlag}
        type="radioListItem"
      />
      <VSpacer size={24} />
      <ListItemHeader label="Environment OneIdentity" />
      <ListItemCheckbox
        description="Questa opzione serve agli sviluppatori per testare la login con OneIdentity in ambiente di UAT."
        disabled={disabled}
        onValueChange={handleOneIdentityEnv}
        selected={oneIdentityEnv === "uat"}
        value="Abilita ambiente di UAT OneIdentity"
      />
      <VSpacer size={24} />
      <ListItemHeader label="Environment CIE" />
      <ListItemCheckbox
        description="Questa opzione serve agli sviluppatori per testare la login con CIE."
        disabled={disabled}
        onValueChange={handleCieEnv}
        selected={useCieUat}
        value={`Abilita endpoint di collaudo (${CieEntityIds.DEV})`}
      />
    </>
  );
};
