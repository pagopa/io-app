/* eslint-disable i18next/no-literal-string -- developer-only screen, strings are never translated */
import {
  ListItemCheckbox,
  ListItemHeader,
  ListItemSwitch,
  RadioGroup,
  RadioItem,
  VSpacer
} from "@io-app/design-system";
import I18n from "i18next";
import { useCallback, useMemo } from "react";

import { updateMixpanelSuperProperties } from "../../../../mixpanelConfig/superProperties";
import { setDebugModeEnabled } from "../../../../store/actions/debug";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../store/hooks";
import { isDebugModeEnabledSelector } from "../../../../store/reducers/debug";
import { setCieEnv } from "../../login/cie/store/actions";
import { cieEnvSelector } from "../../login/cie/store/selectors";
import { CIE_ENVS, CieEnv } from "../../login/cie/utils";
import {
  setOneIdentityEnv,
  setOneIdentityLocalFeatureFlag
} from "../store/actions/loginConfig";
import { ONE_IDENTITY_ENVS } from "../store/reducers/loginConfig";
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
    label: "Usa solo IO",
    description: "Forza le login in ingresso ad utilizzare lo stack di IO."
  },
  {
    accessibilityLabel: "Usa solo OneIdentity",
    id: true,
    label: "Usa solo OneIdentity",
    description:
      "Forza le login in ingresso ad utilizzare lo stack di OneIdentity."
  },
  {
    accessibilityLabel: "Automatico",
    id: undefined,
    label: "Automatico",
    description:
      "Questo è il normale funzionamento dell'app. Usa questa opzione per l'utilizzo comune."
  }
];

const CIE_ENV_OPTIONS: ReadonlyArray<RadioItem<CieEnv>> = [
  {
    accessibilityLabel: "CIE produzione",
    id: CIE_ENVS.PROD,
    label: "Produzione",
    description: "Usa gli endpoint di produzione per l'autenticazione con CIE."
  },
  {
    accessibilityLabel: "CIE preproduzione",
    id: CIE_ENVS.PREPROD,
    label: "Preproduzione",
    description:
      "Usa gli endpoint di preproduzione per l'autenticazione con CIE (L3)."
  }
];

type LoginConfigScreenContentProps = {
  disabled?: boolean;
};

export const LoginConfigScreenContent = ({
  disabled = false
}: LoginConfigScreenContentProps) => {
  const store = useIOStore();
  const dispatch = useIODispatch();

  const cieEnv = useIOSelector(cieEnvSelector);
  const oneIdentityLocalFeatureFlag = useIOSelector(
    oneIdentityLocalFeatureFlagSelector
  );
  const oneIdentityEnv = useIOSelector(oneIdentityEnvSelector);
  const isDebugModeEnabled = useIOSelector(isDebugModeEnabledSelector);

  const radioGroupItems = useMemo(
    () => LOGIN_FLOW_OPTIONS.map(item => ({ ...item, disabled })),
    [disabled]
  );

  const cieEnvItems = useMemo(
    () => CIE_ENV_OPTIONS.map(item => ({ ...item, disabled })),
    [disabled]
  );

  const handleOneIdentityFlow = useCallback(
    (value: OneIdentityLocalFeatureFlag) => {
      dispatch(setOneIdentityLocalFeatureFlag(value));
      void updateMixpanelSuperProperties(store.getState());
    },
    [dispatch, store]
  );

  const handleOneIdentityEnv = useCallback(
    (isUat: boolean) => {
      dispatch(
        setOneIdentityEnv(
          isUat ? ONE_IDENTITY_ENVS.UAT : ONE_IDENTITY_ENVS.PROD
        )
      );
    },
    [dispatch]
  );

  const handleCieEnv = useCallback(
    (value: CieEnv) => {
      dispatch(setCieEnv(value));
    },
    [dispatch]
  );

  const handleDebugMode = useCallback(
    (enabled: boolean) => {
      dispatch(setDebugModeEnabled(enabled));
    },
    [dispatch]
  );

  return (
    <>
      <ListItemSwitch
        disabled={disabled}
        label={I18n.t("profile.main.debugMode")}
        onSwitchValueChange={handleDebugMode}
        testID="debugModeSwitch"
        value={isDebugModeEnabled}
      />
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
        label="Abilita ambiente di UAT OneIdentity"
        onValueChange={handleOneIdentityEnv}
        selected={oneIdentityEnv === ONE_IDENTITY_ENVS.UAT}
      />
      <VSpacer size={24} />
      <ListItemHeader label="Environment CIE" />
      <RadioGroup<CieEnv>
        items={cieEnvItems}
        onPress={handleCieEnv}
        selectedItem={cieEnv}
        type="radioListItem"
      />
      <VSpacer size={24} />
    </>
  );
};
