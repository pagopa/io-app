import * as React from "react";
import { Dispatch } from "redux";
import {
  svGenerateVoucherAvailableState,
  svGenerateVoucherFailure
} from "../store/actions/voucherGeneration";
import { GlobalState } from "../../../../store/reducers/types";
import { connect } from "react-redux";
import ItemsPicker from "../../../../components/ui/ItemsPicker";
import { useEffect, useState } from "react";
import {
  availableStateItemsSelector,
  availableStatesSelector
} from "../store/reducers/availableStates";
import { View } from "native-base";
import { H5 } from "../../../../components/core/typography/H5";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const DestinationSelector: React.FunctionComponent<Props> = (props: Props) => {
  // When the component is mounted load the available states
  useEffect(() => {
    props.requestAvailableState();
  }, []);

  const [selectedState, setSelectedState] = useState<number | undefined>(
    undefined
  );
  const [selectedProvince, setSelectedProvince] = useState<number | undefined>(
    undefined
  );
  const [selectedRegion, setSelectedRegion] = useState<number | undefined>(
    undefined
  );
  const [selectedMunicipality, setSelectedMunicipality] = useState<
    number | undefined
  >(undefined);

  return (
    <>
      <View>
        <H5 color={"bluegreyDark"}>{"Stato"}</H5>
        <ItemsPicker
          placeholder={"Seleziona uno stato"}
          items={props.availableStateItems}
          onValueChange={v => {
            if (typeof v === "number") {
              setSelectedState(v);
            }
          }}
          selectedValue={selectedState}
        />
      </View>
      <View spacer={true} />
      <View>
        <H5 color={"bluegreyDark"}>{"Regione"}</H5>
        <ItemsPicker
          placeholder={"Seleziona una regione"}
          items={props.availableStateItems}
          onValueChange={v => {
            if (typeof v === "number") {
              setSelectedRegion(v);
            }
          }}
          selectedValue={selectedRegion}
        />
      </View>
      <View spacer={true} />
      <View>
        <H5 color={"bluegreyDark"}>{"Provincia"}</H5>
        <ItemsPicker
          placeholder={"Seleziona una provincia"}
          items={props.availableStateItems}
          onValueChange={v => {
            if (typeof v === "number") {
              setSelectedProvince(v);
            }
          }}
          selectedValue={selectedProvince}
        />
      </View>
      <View spacer={true} />
      <View>
        <H5 color={"bluegreyDark"}>{"Comune"}</H5>
        <ItemsPicker
          placeholder={"Seleziona un comune"}
          items={props.availableStateItems}
          onValueChange={v => {
            if (typeof v === "number") {
              setSelectedMunicipality(v);
            }
          }}
          selectedValue={selectedMunicipality}
        />
      </View>
    </>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  requestAvailableState: () =>
    dispatch(svGenerateVoucherAvailableState.request()),
  failure: (reason: string) => dispatch(svGenerateVoucherFailure(reason))
});
const mapStateToProps = (state: GlobalState) => ({
  availableStates: availableStatesSelector(state),
  availableStateItems: availableStateItemsSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DestinationSelector);
