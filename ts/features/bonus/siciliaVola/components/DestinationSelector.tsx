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
import { svGenerateVoucherAvailableMunicipality } from "../store/actions/voucherGeneration";
import { isError, isLoading, isReady } from "../../bpd/model/RemoteValue";
import { useEffect, useState } from "react";

type OwnProps = {
  availableStates: IndexedById<State>;
  selectedState?: State;
  setSelectedState: (state: State) => void;
  selectedMunicipality?: Municipality;
  setSelectedMunicipality: (municipality: Municipality) => void;
};

type Props = OwnProps &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const DestinationSelector: React.FunctionComponent<Props> = (props: Props) => {
  const [searchText, setSearchText] = useState<string | undefined>(undefined);

  const performMunicipalitySearch = (text: string) => {
    if (text.length < 3) {
      return;
    }
    props.requestAvailableMunicipalities(text);
  };

  const debounceRef = React.useRef(debounce(performMunicipalitySearch, 300));

  useEffect(() => {
    if (searchText) {
      debounceRef.current(searchText);
    }
  }, [searchText]);

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
        onRetry={() => true}
      />
      <View spacer />
      <TextboxWithSuggestion<Municipality>
        onChangeText={v => {
          setSearchText(v.length === 0 ? undefined : v);
        }}
        title={"Seleziona un comune"}
        keyExtractor={i => i.name}
        data={
          isReady(props.availableMunicipalities)
            ? toArray(props.availableMunicipalities.value)
            : []
        }
        onSelectValue={v => {
          props.setSelectedMunicipality(v);
          return v.name;
        }}
        renderItem={i => (
          <H4 weight={"Regular"} color={"bluegreyDark"}>
            {i.item.name}
          </H4>
        )}
        label={"Comune"}
        placeholder={"Seleziona un comune"}
        disabled={props.selectedState === undefined}
        isLoading={isLoading(props.availableMunicipalities)}
        isFailed={isError(props.availableMunicipalities)}
        showModalInputTextbox={true}
      />
    </>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  requestAvailableMunicipalities: (subString: string) =>
    dispatch(svGenerateVoucherAvailableMunicipality.request(subString))
});
const mapStateToProps = (state: GlobalState) => ({
  availableMunicipalities: availableMunicipalitiesSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DestinationSelector);
