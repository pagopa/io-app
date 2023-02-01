import { Dispatch } from "redux";
import { connect } from "react-redux";
import { View, ActivityIndicator, FlatList } from "react-native";
import * as React from "react";
import { ListItem } from "native-base";
import { useContext } from "react";
import { GlobalState } from "../../../../store/reducers/types";
import { availableMunicipalitiesSelector } from "../store/reducers/voucherGeneration/availableMunicipalities";
import { isError, isLoading, isReady } from "../../bpd/model/RemoteValue";
import { toArray } from "../../../../store/helpers/indexer";
import { H4 } from "../../../../components/core/typography/H4";
import { Municipality } from "../types/SvVoucherRequest";
import { LightModalContext } from "../../../../components/ui/LightModal";
import I18n from "../../../../i18n";
import { svGenerateVoucherAvailableMunicipality } from "../store/actions/voucherGeneration";
import { Link } from "../../../../components/core/typography/Link";
import { VSpacer } from "../../../../components/core/spacer/Spacer";

type Props = {
  onPress: (municipality: Municipality) => void;
  onRetry: (s?: string) => void;
  selectedText: React.MutableRefObject<string | undefined>;
} & ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const FooterLoading = () => (
  <>
    <VSpacer size={16} />
    <ActivityIndicator
      color={"black"}
      accessible={false}
      importantForAccessibility={"no-hide-descendants"}
      accessibilityElementsHidden={true}
      testID={"activityIndicator"}
    />
  </>
);

const FooterError = (props: Props) => (
  <View style={{ flex: 1, alignItems: "center" }}>
    <H4 weight={"Regular"}>
      {I18n.t("bonus.sv.components.destinationSelector.municipality.ko.label1")}
    </H4>
    <Link
      onPress={() => {
        if (props.selectedText.current) {
          props.requestAvailableMunicipalities(props.selectedText.current);
        }
      }}
    >
      {I18n.t("bonus.sv.components.destinationSelector.municipality.ko.label2")}
    </Link>
  </View>
);

const WrappedMunicipalityFlatList = (props: Props) => {
  const { hideModal } = useContext(LightModalContext);
  return (
    <FlatList
      data={
        isReady(props.availableMunicipalities)
          ? toArray(props.availableMunicipalities.value)
          : []
      }
      ListFooterComponent={
        isLoading(props.availableMunicipalities) ? (
          <FooterLoading />
        ) : (
          isError(props.availableMunicipalities) && FooterError(props)
        )
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
)(WrappedMunicipalityFlatList);
