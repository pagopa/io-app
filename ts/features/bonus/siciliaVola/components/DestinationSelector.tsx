import * as React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { ListItem } from "native-base";
import { debounce } from "lodash";
import { useContext, useEffect, useRef, useState } from "react";
import { FlatList } from "react-native";
import { GlobalState } from "../../../../store/reducers/types";
import TextboxWithSuggestion from "../../../../components/ui/TextboxWithSuggestion";
import { H4 } from "../../../../components/core/typography/H4";
import { IndexedById, toArray } from "../../../../store/helpers/indexer";
import { Municipality, State } from "../types/SvVoucherRequest";
import {
  svGenerateVoucherAvailableMunicipality,
  svGenerateVoucherResetAvailableMunicipality
} from "../store/actions/voucherGeneration";
import { LightModalContext } from "../../../../components/ui/LightModal";
import I18n from "../../../../i18n";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import WrappedFlatList from "./WrappedMunicipalityFlatList";

type OwnProps = {
  availableStates: IndexedById<State>;
  selectedState?: State;
  onStateSelected: (state: State) => void;
  selectedMunicipality?: Municipality;
  onMunicipalitySelected: (municipality?: Municipality) => void;
};

type Props = OwnProps &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const DestinationSelector: React.FunctionComponent<Props> = (props: Props) => {
  const { hideModal } = useContext(LightModalContext);
  const [searchText, setSearchText] = useState<string | undefined>(undefined);

  const refVal = useRef<string | undefined>();

  const performMunicipalitySearch = (text: string) => {
    if (text.length < 3) {
      return;
    }
    props.requestAvailableMunicipalities(text);
  };

  const debounceRef = React.useRef(debounce(performMunicipalitySearch, 300));

  useEffect(() => {
    // Passed to the WrappedFlatList in order to make the selectedText reactable
    // eslint-disable-next-line functional/immutable-data
    refVal.current = searchText;
    if (searchText) {
      debounceRef.current(searchText);
    }
  }, [searchText]);

  const StateFlatList = (
    <FlatList
      data={toArray(props.availableStates)}
      ListFooterComponent={false}
      renderItem={i => (
        <ListItem
          icon={false}
          onPress={() => {
            props.onStateSelected(i.item);
            props.onMunicipalitySelected(undefined);
            hideModal();
          }}
        >
          <H4 weight={"Regular"} color={"bluegreyDark"}>
            {i.item.name}
          </H4>
        </ListItem>
      )}
      keyExtractor={i => i.name}
      keyboardShouldPersistTaps={"handled"}
    />
  );

  return (
    <>
      <TextboxWithSuggestion
        title={I18n.t("bonus.sv.components.destinationSelector.state.title")}
        label={I18n.t("bonus.sv.components.destinationSelector.state.label")}
        placeholder={I18n.t(
          "bonus.sv.components.destinationSelector.state.placeholder"
        )}
        showModalInputTextbox={false}
        wrappedFlatlist={StateFlatList}
        selectedValue={props.selectedState?.name}
      />
      <VSpacer size={16} />
      <TextboxWithSuggestion
        onChangeText={v => {
          setSearchText(v.length === 0 ? undefined : v);
        }}
        title={I18n.t(
          "bonus.sv.components.destinationSelector.municipality.title"
        )}
        label={I18n.t(
          "bonus.sv.components.destinationSelector.municipality.label"
        )}
        placeholder={I18n.t(
          "bonus.sv.components.destinationSelector.municipality.placeholder"
        )}
        disabled={props.selectedState === undefined}
        showModalInputTextbox={true}
        wrappedFlatlist={
          <WrappedFlatList
            onPress={(selectedMunicipality: Municipality) => {
              props.onMunicipalitySelected(selectedMunicipality);
              props.resetAvailableMunicipalities();
            }}
            onRetry={searchText => {
              if (searchText) {
                debounceRef.current(searchText);
              }
            }}
            selectedText={refVal}
          />
        }
        selectedValue={props.selectedMunicipality?.name}
        onClose={props.resetAvailableMunicipalities}
      />
    </>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  requestAvailableMunicipalities: (subString: string) =>
    dispatch(svGenerateVoucherAvailableMunicipality.request(subString)),
  resetAvailableMunicipalities: () =>
    dispatch(svGenerateVoucherResetAvailableMunicipality())
});
const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DestinationSelector);
