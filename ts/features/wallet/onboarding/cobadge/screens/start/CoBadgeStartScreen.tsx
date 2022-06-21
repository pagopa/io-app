import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import _ from "lodash";
import * as React from "react";
import { useEffect, useRef } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { StatusEnum } from "../../../../../../../definitions/pagopa/cobadge/configuration/CoBadgeService";
import { mixpanelTrack } from "../../../../../../mixpanel";
import { GlobalState } from "../../../../../../store/reducers/types";
import { loadCoBadgeAbiConfiguration } from "../../store/actions";
import { getCoBadgeAbiConfigurationSelector } from "../../store/reducers/abiConfiguration";
import { onboardingCoBadgeAbiSelectedSelector } from "../../store/reducers/abiSelected";
import CoBadgeChosenBankScreen from "./CoBadgeChosenBankScreen";
import CoBadgeStartKoDisabled from "./ko/CoBadgeStartKoDisabled";
import CoBadgeStartKoUnavailable from "./ko/CoBadgeStartKoUnavailable";
import LoadAbiConfiguration from "./LoadAbiConfiguration";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const eventTrackName = "WALLET_ONBOARDING_COBADGE_SCREEN_START_RESULT";
type StartScreenState = "All" | "Enabled" | "Disabled" | "Unavailable";

const trackOutput = (screenState: StartScreenState, abi?: string) =>
  mixpanelTrack(eventTrackName, { screen: screenState, abi });

/**
 * The entry screen that orchestrate the different screens
 * @constructor
 * @param props
 */
const CoBadgeStartComponent = (props: Props): React.ReactElement => {
  const { loadAbiConfig, maybeAbiSelected } = props;
  const firstLoading = useRef(true);
  // If a single ABI is selected, we should check the abiConfiguration
  useEffect(() => {
    if (maybeAbiSelected !== undefined && firstLoading.current) {
      loadAbiConfig();
      // eslint-disable-next-line functional/immutable-data
      firstLoading.current = false;
    }
  }, [loadAbiConfig, maybeAbiSelected]);

  // All ABI selected
  if (props.maybeAbiSelected === undefined) {
    void trackOutput("All");
    return <CoBadgeChosenBankScreen testID={"CoBadgeChosenBankScreenAll"} />;
  }

  // The ABI configuration is loading
  if (props.abiSelectedConfiguration.kind !== "PotSome") {
    return <LoadAbiConfiguration testID={"LoadAbiConfiguration"} />;
  }
  switch (props.abiSelectedConfiguration.value) {
    case StatusEnum.enabled:
      void trackOutput("Enabled", props.maybeAbiSelected);
      // Single ABI (bank) screen that allow to start the search
      return (
        <CoBadgeChosenBankScreen
          abi={props.maybeAbiSelected}
          testID={"CoBadgeChosenBankScreenSingleBank"}
        />
      );
    case StatusEnum.disabled:
      void trackOutput("Disabled", props.maybeAbiSelected);
      // The chosen ABI is disabled (not yet available)
      return <CoBadgeStartKoDisabled />;
    case StatusEnum.unavailable:
      void trackOutput("Unavailable", props.maybeAbiSelected);
      // THe chosen ABI is unavailable (technical problems)
      return <CoBadgeStartKoUnavailable />;
  }
};

const CoBadgeStartMemo = React.memo(
  CoBadgeStartComponent,
  (prev: Props, curr: Props) =>
    prev.maybeAbiSelected === curr.maybeAbiSelected &&
    prev.abiSelectedConfiguration.kind === curr.abiSelectedConfiguration.kind &&
    pot.isSome(prev.abiSelectedConfiguration) &&
    pot.isSome(curr.abiSelectedConfiguration) &&
    _.isEqual(
      curr.abiSelectedConfiguration.value,
      prev.abiSelectedConfiguration.value
    )
);

const CoBadgeStartScreen = (props: Props) => <CoBadgeStartMemo {...props} />;

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadAbiConfig: () => dispatch(loadCoBadgeAbiConfiguration.request())
});

const mapStateToProps = (state: GlobalState) => {
  const maybeAbiSelected = onboardingCoBadgeAbiSelectedSelector(state);
  const abiSelectedConfiguration = pipe(
    maybeAbiSelected,
    O.fromNullable,
    O.map(abiSelected =>
      getCoBadgeAbiConfigurationSelector(state, abiSelected)
    ),
    O.getOrElseW(() => pot.some(StatusEnum.disabled))
  );
  return { maybeAbiSelected, abiSelectedConfiguration };
};

export default connect(mapStateToProps, mapDispatchToProps)(CoBadgeStartScreen);
