import * as React from "react";
import { View } from "native-base";
import { connect } from "react-redux";
import { StyleSheet } from "react-native";
import { fromNullable } from "fp-ts/lib/Option";
import { GlobalState } from "../../../../../../store/reducers/types";
import { Dispatch } from "../../../../../../store/actions/types";
import { H4 } from "../../../../../../components/core/typography/H4";
import I18n from "../../../../../../i18n";
import { eycaDetailsInformationSelector } from "../../../store/reducers/eyca/details";
import { cgnEycaActivationRequest } from "../../../store/actions/eyca/activation";
import IconFont from "../../../../../../components/ui/IconFont";
import { IOColors } from "../../../../../../components/core/variables/IOColors";
import { EycaCard } from "../../../../../../../definitions/cgn/EycaCard";
import EycaStatusDetailsComponent from "./EycaStatusDetailsComponent";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const styles = StyleSheet.create({
  rowBlock: {
    flexDirection: "row"
  },
  spaced: {
    justifyContent: "space-between"
  }
});
const ICON_SIZE = 24;

const EycaDetailComponent: React.FunctionComponent<Props> = (props: Props) => {
  const renderComponentEycaStatus = (eyca: EycaCard) => {
    switch (eyca.status) {
      case "ACTIVATED":
      case "REVOKED":
      case "EXPIRED":
        return <EycaStatusDetailsComponent eycaCard={eyca} />;
      case "PENDING":
      default:
        return <></>;
    }
  };

  return fromNullable(props.eyca).fold(
    <>
      <View style={[styles.rowBlock]}>
        <H4>{I18n.t("bonus.cgn.detail.status.eyca")}</H4>
        <View hspacer small />
        <IconFont name={"io-info"} size={ICON_SIZE} color={IOColors.blue} />
      </View>
      <View spacer />
    </>,
    eyca => renderComponentEycaStatus(eyca)
  );
};

const mapStateToProps = (state: GlobalState) => ({
  eyca: eycaDetailsInformationSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  requestEycaActivation: () => dispatch(cgnEycaActivationRequest())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EycaDetailComponent);
