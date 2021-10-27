import * as React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { ListItem, View } from "native-base";
import { debounce } from "lodash";
import { useContext, useEffect, useState } from "react";
import { FlatList } from "react-native";
import { GlobalState } from "../../../../store/reducers/types";
import TextboxWithSuggestion from "../../../../components/ui/TextboxWithSuggestion";
import { H4 } from "../../../../components/core/typography/H4";
import { IndexedById, toArray } from "../../../../store/helpers/indexer";
import { Municipality, State } from "../types/SvVoucherRequest";
import { availableMunicipalitiesSelector } from "../store/reducers/voucherGeneration/availableMunicipalities";
import { svGenerateVoucherAvailableMunicipality } from "../store/actions/voucherGeneration";
import { isError, isLoading } from "../../bpd/model/RemoteValue";
import { LightModalContext } from "../../../../components/ui/LightModal";
import I18n from "../../../../i18n";
import WrappedFlatlist from "./WrappedMunicipalityFlatlist";

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
  const { hideModal } = useContext(LightModalContext);
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
      <TextboxWithSuggestion
        title={I18n.t("bonus.sv.components.destinationSelector.state.title")}
        label={I18n.t("bonus.sv.components.destinationSelector.state.label")}
        placeholder={I18n.t(
          "bonus.sv.components.destinationSelector.state.placeholder"
        )}
        isLoading={false}
        showModalInputTextbox={false}
        wrappedFlatlist={
          <FlatList
            data={toArray(props.availableStates)}
            ListFooterComponent={false}
            renderItem={i => (
              <ListItem
                icon={false}
                onPress={() => {
                  props.setSelectedState(i.item);
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
        }
        selectedValue={props.selectedState?.name}
      />
      <View spacer />
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
        isLoading={isLoading(props.availableMunicipalities)}
        isFailed={isError(props.availableMunicipalities)}
        showModalInputTextbox={true}
        wrappedFlatlist={
          <WrappedFlatlist onPress={props.setSelectedMunicipality} />
        }
        selectedValue={props.selectedMunicipality?.name}
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
