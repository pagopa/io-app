import * as React from "react";
import { useState } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import I18n from "../../../i18n";
import { GlobalState } from "../../../store/reducers/types";
import {
  bottomSheetContent,
  useIOBottomSheetRaw
} from "../../../utils/bottomSheet";
import { useActionOnFocus } from "../../../utils/hooks/useOnFocus";
import BancomatInformation from "../bancomat/screen/BancomatInformation";
import { onboardingBancomatAddedPansSelector } from "../onboarding/bancomat/store/reducers/addedPans";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const newBancomatBottomSheet = () => {
  const { present: openBottomSheet, dismiss } = useIOBottomSheetRaw(
    385,
    bottomSheetContent
  );
  return {
    present: () =>
      openBottomSheet(
        <BancomatInformation onAddPaymentMethod={dismiss} hideInfobox={true} />,
        I18n.t("wallet.bancomat.details.debit.title"),
      ),
    dismiss
  };
};

/**
 * Handle the notification for a new payment method added
 * TODO: add other methods, handle only bancomat atm
 * @constructor
 */
const NewPaymentMethodAddedNotifier = (props: Props) => {
  // Save the latest visualized bottom sheet, in order to avoid to show it again if focus changed
  const [lastNotifiedBancomatHash, setLastNotifiedBancomatHash] = useState<
    string
  >("");

  const { present } = newBancomatBottomSheet();

  useActionOnFocus(() => {
    const lastAddedHash = props.addedBancomat.reduce(
      (acc, val) => acc + val.idWallet.toString(),
      ""
    );
    // a new set of bancomat has been added and no bottomsheet has been dispayed
    if (lastAddedHash !== "" && lastNotifiedBancomatHash !== lastAddedHash) {
      setLastNotifiedBancomatHash(lastAddedHash);
      void present();
    }
  });

  return null;
};

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (state: GlobalState) => ({
  addedBancomat: onboardingBancomatAddedPansSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewPaymentMethodAddedNotifier);
