import * as React from "react";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../store/reducers/types";
import { connect } from "react-redux";
import { View } from "native-base";
import TextboxWithSuggestion from "../../../../components/ui/TextboxWithSuggestion";
import { H4 } from "../../../../components/core/typography/H4";
import { IndexedById, toArray } from "../../../../store/helpers/indexer";
import { Municipality, State } from "../types/SvVoucherRequest";
import { debounce } from "lodash";
import { availableMunicipalitiesSelector } from "../store/reducers/voucherGeneration/availableMunicipalities";

type OwnProps = {
  availableStates: IndexedById<State>;
  selectedState?: number;
  setSelectedState: (state: State) => void;
};

type Props = OwnProps &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const DestinationSelector: React.FunctionComponent<Props> = (props: Props) => {
  // const debounceRef = React.useRef(debounce(performMunicipalitySearch, 300));

  return (
    <>
      <TextboxWithSuggestion<State>
        onChangeText={() => true}
        title={"Seleziona uno stato"}
        keyExtractor={i => i.name}
        data={toArray(props.availableStates)}
        onSelectValue={v => {
          props.setSelectedState(v);
          return v.name;
        }}
        renderItem={i => (
          <H4 weight={"Regular"} color={"bluegreyDark"}>
            {i.item.name}
          </H4>
        )}
        label={"Stato"}
        placeholder={"Seleziona uno stato"}
        isLoading={false}
        showModalInputTextbox={false}
      />
      <View spacer />
      {/*<TextboxWithSuggestion<Municipality>*/}
      {/*  onChangeText={() => true}*/}
      {/*  title={"Seleziona un comune"}*/}
      {/*  keyExtractor={i => i.name}*/}
      {/*  data={toArray(props.availableStates)}*/}
      {/*  onSelectValue={v => {*/}
      {/*    props.setSelectedState(v);*/}
      {/*    return v.name;*/}
      {/*  }}*/}
      {/*  renderItem={i => (*/}
      {/*    <H4 weight={"Regular"} color={"bluegreyDark"}>*/}
      {/*      {i.item.name}*/}
      {/*    </H4>*/}
      {/*  )}*/}
      {/*  label={"Comune"}*/}
      {/*  placeholder={"Seleziona un comune"}*/}
      {/*  isLoading={false}*/}
      {/*  showModalInputTextbox={true}*/}
      {/*/>*/}
    </>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({});
const mapStateToProps = (state: GlobalState) => ({
  availableMunicipalities: availableMunicipalitiesSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DestinationSelector);
