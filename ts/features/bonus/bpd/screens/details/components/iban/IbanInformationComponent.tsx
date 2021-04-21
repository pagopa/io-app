import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Placeholder from "rn-placeholder";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { fold, RemoteValue } from "../../../../model/RemoteValue";
import { bpdIbanInsertionStart } from "../../../../store/actions/iban";
import { bpdIbanSelector } from "../../../../store/reducers/details/activation";
import { bpdTechnicalAccountSelector } from "../../../../store/reducers/details/activation/technicalAccount";
import {
  BaseIbanInformationComponent,
  BaseIbanProps
} from "./BaseIbanInformationComponent";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const LoadingIban = () => <Placeholder.Box width={"100%"} animate={"shine"} />;

/**
 * Render the Iban based on the RemoteValue.
 * For safeness, even undefined, remote and error cases are managed, although the iban detail
 * screen is only accessible if bpd has been activated.
 * @param props
 * @constructor
 */
const RenderRemoteIban = (
  props: {
    iban: RemoteValue<string | undefined, Error>;
  } & Omit<BaseIbanProps, "iban">
) =>
  fold(
    props.iban,
    () => null,
    () => <LoadingIban />,
    value => (
      <BaseIbanInformationComponent
        onInsertIban={props.onInsertIban}
        iban={value}
        technicalAccount={props.technicalAccount}
      />
    ),
    _ => null
  );

/**
 * Link {@link BaseIbanInformationComponent} to the business logic
 * Read the iban RemoteValue<string, Error> from the store
 * Dispatch bpdIbanInsertionStart() in case of new iban insertion (or modification
 * @param props
 * @constructor
 */
const IbanInformationComponent: React.FunctionComponent<Props> = props => (
  <RenderRemoteIban
    iban={props.iban}
    onInsertIban={props.startIbanOnboarding}
    technicalAccount={props.technicalAccount}
  />
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  startIbanOnboarding: () => dispatch(bpdIbanInsertionStart())
});

const mapStateToProps = (state: GlobalState) => ({
  iban: bpdIbanSelector(state),
  technicalAccount: bpdTechnicalAccountSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IbanInformationComponent);
