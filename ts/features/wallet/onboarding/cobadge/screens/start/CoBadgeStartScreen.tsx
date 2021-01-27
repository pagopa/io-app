import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { StatusEnum } from "../../../../../../../definitions/pagopa/cobadge/configuration/CoBadgeService";
import { GlobalState } from "../../../../../../store/reducers/types";
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
 * The orchestration screen
 * @constructor
 * @param props
 */
const CoBadgeStartScreen = (props: Props): React.ReactElement => {
  // TODO: add loading
  if (props.maybeAbiSelected === undefined) {
    return <CoBadgeAllBanksScreen />;
  }

  if (props.abiSelectedConfiguration.kind !== "PotSome") {
    return <LoadAbiConfiguration />;
  }
  switch (props.abiSelectedConfiguration.value) {
    case StatusEnum.active:
      return <CoBadgeSingleBankScreen />;
    case StatusEnum.disabled:
      return <CoBadgeStartKoDisabled />;
    case StatusEnum.unavailable:
      return <CoBadgeStartKoUnavailable />;
  }
  // ALL Abi
};

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (state: GlobalState) => {
  const maybeAbiSelected = onboardingCoBadgeAbiSelectedSelector(state);
  const abiSelectedConfiguration = fromNullable(maybeAbiSelected)
    .map(abiSelected => getCoBadgeAbiConfigurationSelector(state, abiSelected))
    .getOrElse(pot.some(StatusEnum.disabled));
  return { maybeAbiSelected, abiSelectedConfiguration };
};

export default connect(mapStateToProps, mapDispatchToProps)(CoBadgeStartScreen);
