import * as React from "react";
import { Dispatch } from "redux";
import {
  svGenerateVoucherAvailableMunicipality,
  svGenerateVoucherAvailableProvince,
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
import {
  availableProvincesItemsSelector,
  availableProvincesSelector
} from "../store/reducers/availableProvinces";
import {
  availableMunicipalitiesItemsSelector,
  availableMunicipalitiesSelector
} from "../store/reducers/availableMunicipalities";
import i18n from "../../../../i18n";

type OwnProps = {
  selectedState: number | undefined;
  setSelectedState: (stateId: number) => void;
  selectedRegion: number | undefined;
  setSelectedRegion: (regionId: number) => void;
  selectedProvince: string | undefined;
  setSelectedProvince: (provinceId: string) => void;
  selectedMunicipality: string | undefined;
  setSelectedMunicipality: (municipalityId: string) => void;
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
    {i18n.t("global.genericRetry")}
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

  useEffect(() => {
    if (props.selectedRegion)
      props.requestAvailableProvinces(props.selectedRegion);
  }, [props.selectedRegion]);

  useEffect(() => {
    if (props.selectedProvince)
      props.requestAvailableMunicipalities(props.selectedProvince);
  }, [props.selectedProvince]);

  return (
    <>
      <View>
        <View style={{ flex: 1, flexDirection: "row" }}>
          <H5 color={"bluegreyDark"}>
            {i18n.t(
              "bonus.sv.voucherGeneration.selectDestinationCommon.state.label"
            )}
          </H5>
          <View hspacer={true} />
          {isLoading(props.availableStates) && <LoadingComponent />}
          {isError(props.availableStates) &&
            ErrorComponent(props.requestAvailableState)}
        </View>
        <ItemsPicker
          key={"state"}
          placeholder={i18n.t(
            "bonus.sv.voucherGeneration.selectDestinationCommon.state.placeholder"
          )}
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
          <H5 color={"bluegreyDark"}>
            {i18n.t(
              "bonus.sv.voucherGeneration.selectDestinationCommon.region.label"
            )}
          </H5>
          <View hspacer={true} />
          {isLoading(props.availableRegions) && <LoadingComponent />}
          {isError(props.availableRegions) &&
            ErrorComponent(props.requestAvailableRegions)}
        </View>
        <ItemsPicker
          key={"region"}
          placeholder={i18n.t(
            "bonus.sv.voucherGeneration.selectDestinationCommon.region.placeholder"
          )}
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
        <View style={{ flex: 1, flexDirection: "row" }}>
          <H5 color={"bluegreyDark"}>
            {i18n.t(
              "bonus.sv.voucherGeneration.selectDestinationCommon.province.label"
            )}
          </H5>
          <View hspacer={true} />
          {isLoading(props.availableProvinces) && <LoadingComponent />}
          {isError(props.availableProvinces) &&
            ErrorComponent(() => {
              if (props.selectedRegion)
                props.requestAvailableProvinces(props.selectedRegion);
            })}
        </View>
        <ItemsPicker
          key={"province"}
          placeholder={i18n.t(
            "bonus.sv.voucherGeneration.selectDestinationCommon.province.placeholder"
          )}
          items={props.availableProvincesItems}
          onValueChange={v => {
            if (typeof v === "string") {
              props.setSelectedProvince(v);
            }
          }}
          selectedValue={props.selectedProvince}
          disabled={props.selectedRegion === undefined}
        />
      </View>
      <View spacer={true} />
      <View>
        <View style={{ flex: 1, flexDirection: "row" }}>
          <H5 color={"bluegreyDark"}>
            {i18n.t(
              "bonus.sv.voucherGeneration.selectDestinationCommon.municipality.label"
            )}
          </H5>
          <View hspacer={true} />
          {isLoading(props.availableMunicipalities) && <LoadingComponent />}
          {isError(props.availableMunicipalities) &&
            ErrorComponent(() => {
              if (props.selectedProvince)
                props.requestAvailableMunicipalities(props.selectedProvince);
            })}
        </View>
        <ItemsPicker
          key={"municipality"}
          placeholder={i18n.t(
            "bonus.sv.voucherGeneration.selectDestinationCommon.municipality.placeholder"
          )}
          items={props.availableMunicipalitiesItems}
          onValueChange={v => {
            if (typeof v === "string") {
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
  requestAvailableProvinces: (regionId: number) =>
    dispatch(svGenerateVoucherAvailableProvince.request(regionId)),
  requestAvailableMunicipalities: (provinceId: string) =>
    dispatch(svGenerateVoucherAvailableMunicipality.request(provinceId)),
  failure: (reason: string) => dispatch(svGenerateVoucherFailure(reason))
});
const mapStateToProps = (state: GlobalState) => ({
  availableStates: availableStatesSelector(state),
  availableStatesItems: availableStateItemsSelector(state),
  availableRegions: availableRegionsSelector(state),
  availableRegionsItems: availableRegionsItemsSelector(state),
  availableProvinces: availableProvincesSelector(state),
  availableProvincesItems: availableProvincesItemsSelector(state),
  availableMunicipalities: availableMunicipalitiesSelector(state),
  availableMunicipalitiesItems: availableMunicipalitiesItemsSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DestinationSelector);
