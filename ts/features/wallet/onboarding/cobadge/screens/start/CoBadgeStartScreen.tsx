import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { useEffect } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { StatusEnum } from "../../../../../../../definitions/pagopa/cobadge/configuration/CoBadgeService";
import { GlobalState } from "../../../../../../store/reducers/types";
import { loadCoBadgeAbiConfiguration } from "../../store/actions";
import { getCoBadgeAbiConfigurationSelector } from "../../store/reducers/abiConfiguration";
import { onboardingCoBadgeAbiSelectedSelector } from "../../store/reducers/abiSelected";
import CoBadgeAllBanksScreen from "./CoBadgeAllBanksScreen";
import CoBadgeSingleBankScreen from "./CoBadgeSingleBankScreen";
import CoBadgeStartKoDisabled from "./ko/CoBadgeStartKoDisabled";
import CoBadgeStartKoUnavailable from "./ko/CoBadgeStartKoUnavailable";
import LoadAbiConfiguration from "./LoadAbiConfiguration";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * The entry screen that orchestrate the different screens
 * @constructor
 * @param props
 */
const CoBadgeStartScreen = (props: Props): React.ReactElement => {
  // All ABI selected
  if (props.maybeAbiSelected === undefined) {
    return <CoBadgeAllBanksScreen />;
  }
  // If a single ABI is selected, we should check the abiConfiguration
  useEffect(() => {
    const loadAbiConfig = pot.fold(
      props.abiSelectedConfiguration,
      () => props.loadAbiConfig,
      () => undefined,
      _ => undefined,
      _ => props.loadAbiConfig,
      _ => undefined,
      _ => undefined,
      () => undefined,
      _ => props.loadAbiConfig
    );
    loadAbiConfig?.();
  }, []);

  // The ABI configuration is loading
  if (props.abiSelectedConfiguration.kind !== "PotSome") {
    return <LoadAbiConfiguration />;
  }
  switch (props.abiSelectedConfiguration.value) {
    case StatusEnum.enabled:
      // Single ABI (bank) screen that allow to start the search
      return <CoBadgeSingleBankScreen />;
    case StatusEnum.disabled:
      // The chosen ABI is disabled (not yet available)
      return <CoBadgeStartKoDisabled />;
    case StatusEnum.unavailable:
      // THe chosen ABI is unavailable (technical problems)
      return <CoBadgeStartKoUnavailable />;
  }
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadAbiConfig: () => dispatch(loadCoBadgeAbiConfiguration.request())
});

const mapStateToProps = (state: GlobalState) => {
  const maybeAbiSelected = onboardingCoBadgeAbiSelectedSelector(state);
  const abiSelectedConfiguration = fromNullable(maybeAbiSelected)
    .map(abiSelected => getCoBadgeAbiConfigurationSelector(state, abiSelected))
    .getOrElse(pot.some(StatusEnum.disabled));
  return { maybeAbiSelected, abiSelectedConfiguration };
};

export default connect(mapStateToProps, mapDispatchToProps)(CoBadgeStartScreen);
