import { Dispatch } from "redux";
import { GlobalState } from "../../../../store/reducers/types";
import { availableMunicipalitiesSelector } from "../store/reducers/voucherGeneration/availableMunicipalities";
import { connect } from "react-redux";
import { isLoading, isReady } from "../../bpd/model/RemoteValue";
import { toArray } from "../../../../store/helpers/indexer";
import { H4 } from "../../../../components/core/typography/H4";
import { ActivityIndicator, FlatList } from "react-native";
import * as React from "react";
import { Municipality } from "../types/SvVoucherRequest";
import { ListItem, View } from "native-base";
import { useContext } from "react";
import { LightModalContext } from "../../../../components/ui/LightModal";

type Props = {
  onPress: (municipality: Municipality) => void;
} & ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const FooterLoading = () => (
  <>
    <View spacer={true} />
    <ActivityIndicator
      color={"black"}
      accessible={false}
      importantForAccessibility={"no-hide-descendants"}
      accessibilityElementsHidden={true}
      testID={"activityIndicator"}
    />
  </>
);

const WrappedMunicipalityFlatlist = (props: Props) => {
  const { hideModal } = useContext(LightModalContext);
  return (
    <FlatList
      data={
        isReady(props.availableMunicipalities)
          ? toArray(props.availableMunicipalities.value)
          : []
      }
      ListFooterComponent={
        isLoading(props.availableMunicipalities) && <FooterLoading />
      }
      renderItem={i => (
        <ListItem
          icon={false}
          onPress={() => {
            props.onPress(i.item);
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
};

const mapDispatchToProps = (_: Dispatch) => ({});
const mapStateToProps = (state: GlobalState) => ({
  availableMunicipalities: availableMunicipalitiesSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WrappedMunicipalityFlatlist);
