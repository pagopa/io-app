import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H4 } from "../../../../components/core/typography/H4";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import I18n from "../../../../i18n";
import { GlobalState } from "../../../../store/reducers/types";
import { format, formatDateAsLocal } from "../../../../utils/dates";
import { showToast } from "../../../../utils/showToast";
import { bpdAllData } from "../store/actions/details";
import { bpdLastUpdateSelector } from "../store/reducers/details/lastUpdate";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center"
  }
});

/**
 * This component show the last time in which the bpd periods are loaded correctly
 * and allow to request a refresh of the bpd periods data.
 * @param props
 */
const BpdLastUpdateComponent: React.FunctionComponent<Props> = (
  props: Props
) => {
  const [isFirstRender, setIsFirstRender] = useState(true);
  const { potLastUpdate } = props;
  useEffect(() => {
    if (!isFirstRender) {
      if (pot.isError(potLastUpdate)) {
        showToast(I18n.t("global.genericError"), "danger");
      }
    } else {
      setIsFirstRender(false);
    }
  }, [potLastUpdate, isFirstRender]);

  return (
    <View style={[styles.row, IOStyles.horizontalContentPadding]}>
      {!pot.isNone(props.potLastUpdate) && (
        <H4 weight={"Regular"}>
          {I18n.t("bonus.bpd.details.lastUpdate", {
            hour: format(props.potLastUpdate.value, "HH:mm"),
            date: formatDateAsLocal(props.potLastUpdate.value, true, true)
          })}
        </H4>
      )}
    </View>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  potLastUpdate: bpdLastUpdateSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadBonus: () => dispatch(bpdAllData.request())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BpdLastUpdateComponent);
