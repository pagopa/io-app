import { ActionType } from "typesafe-actions";
import { PaymentManagerClient } from "../../../../../../api/pagopa";
import { PaymentManagerToken } from "../../../../../../types/pagopa";
import { SessionManager } from "../../../../../../utils/SessionManager";
import { addPrivativeToWallet } from "../../store/actions";

export function* handleAddPrivativeToWallet(
  addCobadgeToWallet: ReturnType<
    typeof PaymentManagerClient
  >["addCobadgeToWallet"],
  sessionManager: SessionManager<PaymentManagerToken>,
  addAction: ActionType<typeof addPrivativeToWallet.request>
) {}
