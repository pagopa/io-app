import { Option } from "fp-ts/lib/Option";
import React from "react";
import { connect } from "react-redux";
import { GlobalState } from "../../store/reducers/types";
import { OutcomeCodesKey } from "../../types/outcomeCode";

type OwnProps = {
  outcomeCodeKey: Option<OutcomeCodesKey>;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps>;
const OutcomeCodeMessageComponent: React.FC<Props> = (props: Props) => <></>;

const mapStateToProps = (state: GlobalState, props: OwnProps) => ({
  sectionStatus: sectionStatusSelector(props.outcomeCodeKey)(state)
});
export default connect(mapStateToProps)(OutcomeCodeMessageComponent);
