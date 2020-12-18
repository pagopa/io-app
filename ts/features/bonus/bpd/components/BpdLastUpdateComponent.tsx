import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import * as React from "react";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../../i18n";
import { H4 } from "../../../../components/core/typography/H4";
import { Link } from "../../../../components/core/typography/Link";
import { GlobalState } from "../../../../store/reducers/types";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { bpdDetailsLoadAll } from "../store/actions/details";
import { format, formatDateAsLocal } from "../../../../utils/dates";
import { showToast } from "../../../../utils/showToast";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  addButton: {
    width: "100%"
  }
});

const Spinner = () => (
  <ActivityIndicator
    color={"black"}
    accessible={false}
    importantForAccessibility={"no-hide-descendants"}
    accessibilityElementsHidden={true}
  />
);

const UpdateLabel = (props: Props & { caption: string }) =>
  pot.isLoading(props.potLastUpdate) ? (
    <Spinner />
  ) : (
    <Link onPress={props.loadBonus}>{props.caption}</Link>
  );

const BpdLastUpdateComponent: React.FunctionComponent<Props> = (
  props: Props
) => {
  const [potState, setPotCurrentState] = useState(props.potLastUpdate.kind);
  useEffect(() => {
    if (props.potLastUpdate.kind !== potState) {
      setPotCurrentState(props.potLastUpdate.kind);
      if (pot.isError(props.potLastUpdate)) {
        showToast(I18n.t("global.genericError"), "danger");
      }
    }
  }, [props.potLastUpdate.kind]);

  return (
    <View style={[styles.row, IOStyles.horizontalContentPadding]}>
      {!pot.isNone(props.potLastUpdate) && (
        <H4 weight={"Regular"}>
          Aggiornato alle {format(props.potLastUpdate.value, "HH:mm")} del{" "}
          {formatDateAsLocal(props.potLastUpdate.value, true, true)}
        </H4>
      )}
      <UpdateLabel
        {...props}
        caption={I18n.t("global.buttons.update").toLowerCase()}
      />
    </View>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  potLastUpdate: state.bonus.bpd.details.lastUpdate
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadBonus: () => dispatch(bpdDetailsLoadAll())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BpdLastUpdateComponent);
