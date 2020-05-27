import { NonEmptyString } from "italia-ts-commons/lib/strings";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { RTron } from "../../../../boot/configureStoreAndPersistor";
import { GlobalState } from "../../../../store/reducers/types";
import { FamilyMember } from "../../types/eligibility";
import { ActivateBonusComponent } from "./ActivateBonusComponent";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen allows the user to visualize the amount of the bonus available, the family composition, and offers two CTA:
 * - Cancel: Abort the bonus request
 * - Activate the bonus: Start the procedure to activate the bonus
 * The screen is tied to the business logic and is composed using {@link ActivateBonusComponent}
 * @param props
 * @constructor
 */
const ActivateBonusScreen: React.FunctionComponent<Props> = props => {
  return (
    <ActivateBonusComponent
      onCancel={props.onCancel}
      onRequestBonus={props.onActivateBonus}
      bonusAmount={props.bonusAmount}
      familyMembers={props.familyMembers}
    />
  );
};

const mapDispatchToProps = (_: Dispatch) => ({
  // TODO: link with the right dispatch action
  onCancel: () => {
    RTron.log("CANCEL");
  },
  // TODO: link with the right dispatch action
  onActivateBonus: () => {
    RTron.log("BONUS REQUEST");
  }
});

// TODO: remove this mock data after the linking with redux
const mockFamiluMembers: ReadonlyArray<FamilyMember> = [
  {
    name: "Chiara" as NonEmptyString,
    surname: "D'Anassimandro" as NonEmptyString
  },
  {
    name: "Giovanni" as NonEmptyString,
    surname: "Filippi" as NonEmptyString
  },
  { name: "Piero" as NonEmptyString, surname: "Filippi" as NonEmptyString }
];

const mapStateToProps = (_: GlobalState) => ({
  // TODO: link with the right reducer
  bonusAmount: 500,
  // TODO: link with the right reducer
  familyMembers: mockFamiluMembers
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ActivateBonusScreen);
