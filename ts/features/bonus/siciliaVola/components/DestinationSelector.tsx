import * as React from "react";
import { Dispatch } from "redux";
import {
  svGenerateVoucherAvailableRegion,
  svGenerateVoucherAvailableState,
  svGenerateVoucherFailure
} from "../store/actions/voucherGeneration";
import { GlobalState } from "../../../../store/reducers/types";
import { connect } from "react-redux";
import ItemsPicker from "../../../../components/ui/ItemsPicker";
import { useEffect } from "react";
import {
  availableStateItemsSelector,
  availableStatesSelector
} from "../store/reducers/availableStates";
import { View } from "native-base";
import { H5 } from "../../../../components/core/typography/H5";
import { ActivityIndicator } from "react-native";
import { isError, isLoading } from "../../bpd/model/RemoteValue";
import {
  availableRegionsItemsSelector,
  availableRegionsSelector
} from "../store/reducers/availableRegions";

type OwnProps = {
  selectedState: number | undefined;
  setSelectedState: (stateId: number) => void;
  selectedRegion: number | undefined;
  setSelectedRegion: (regionId: number) => void;
  selectedProvince: number | undefined;
  setSelectedProvince: (provinceId: number) => void;
  selectedMunicipality: number | undefined;
  setSelectedMunicipality: (municipalityId: number) => void;
};

const italyId = 14;

type Props = OwnProps &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const LoadingComponent = () => (
  <ActivityIndicator
    color={"black"}
    accessible={false}
    importantForAccessibility={"no-hide-descendants"}
    accessibilityElementsHidden={true}
  />
);

const ErrorComponent = (onPress: () => void) => (
  <H5
    color={"red"}
    style={{ textDecorationLine: "underline" }}
    onPress={onPress}
  >
    {"Riprova"}
  </H5>
);

const DestinationSelector: React.FunctionComponent<Props> = (props: Props) => {
  // When the component is mounted load the available states
  useEffect(() => {
    props.requestAvailableState();
  }, []);

  useEffect(() => {
    if (props.selectedState && props.selectedState === italyId)
      props.requestAvailableRegions();
  }, [props.selectedState]);

  return (
    <>
      <View>
        <View style={{ flex: 1, flexDirection: "row" }}>
          <H5 color={"bluegreyDark"}>{"Stato"}</H5>
          <View hspacer={true} />
          {isLoading(props.availableStates) && <LoadingComponent />}
          {isError(props.availableStates) &&
            ErrorComponent(props.requestAvailableState)}
        </View>
        <ItemsPicker
          placeholder={"Seleziona uno stato"}
          items={props.availableStatesItems}
          onValueChange={v => {
            if (typeof v === "number") {
              props.setSelectedState(v);
            }
          }}
          selectedValue={props.selectedState}
        />
      </View>
      <View spacer={true} />
      <View>
        <View style={{ flex: 1, flexDirection: "row" }}>
          <H5 color={"bluegreyDark"}>{"Regione"}</H5>
          <View hspacer={true} />
          {isLoading(props.availableRegions) && <LoadingComponent />}
          {isError(props.availableRegions) &&
            ErrorComponent(props.requestAvailableState)}
        </View>
        <ItemsPicker
          placeholder={"Seleziona una regione"}
          items={props.availableRegionsItems}
          onValueChange={v => {
            if (typeof v === "number") {
              props.setSelectedRegion(v);
            }
          }}
          selectedValue={props.selectedRegion}
          disabled={
            props.selectedState === undefined || props.selectedState !== italyId
          }
        />
      </View>
      <View spacer={true} />
      <View>
        <H5 color={"bluegreyDark"}>{"Provincia"}</H5>
        <ItemsPicker
          placeholder={"Seleziona una provincia"}
          items={props.availableStatesItems}
          onValueChange={v => {
            if (typeof v === "number") {
              props.setSelectedProvince(v);
            }
          }}
          selectedValue={props.selectedProvince}
          disabled={props.selectedRegion === undefined}
        />
      </View>
      <View spacer={true} />
      <View>
        <H5 color={"bluegreyDark"}>{"Comune"}</H5>
        <ItemsPicker
          placeholder={"Seleziona un comune"}
          items={props.availableStatesItems}
          onValueChange={v => {
            if (typeof v === "number") {
              props.setSelectedMunicipality(v);
            }
          }}
          selectedValue={props.selectedMunicipality}
          disabled={props.selectedProvince === undefined}
        />
      </View>
    </>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  requestAvailableState: () =>
    dispatch(svGenerateVoucherAvailableState.request()),
  requestAvailableRegions: () =>
    dispatch(svGenerateVoucherAvailableRegion.request()),
  failure: (reason: string) => dispatch(svGenerateVoucherFailure(reason))
});
const mapStateToProps = (state: GlobalState) => ({
  availableStates: availableStatesSelector(state),
  availableStatesItems: availableStateItemsSelector(state),
  availableRegions: availableRegionsSelector(state),
  availableRegionsItems: availableRegionsItemsSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DestinationSelector);
