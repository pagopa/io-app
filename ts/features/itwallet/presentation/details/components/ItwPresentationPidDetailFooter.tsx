import { View } from "react-native";
import { ListItemAction } from "@pagopa/io-app-design-system";
import { constNull } from "fp-ts/lib/function";
import { memo } from "react";
import I18n from "../../../../../i18n";
import { useItwStartCredentialSupportRequest } from "../hooks/useItwStartCredentialSupportRequest";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";

const POWERED_BY_IT_WALLET = "Powered by IT-Wallet";

type Props = {
  credential: StoredCredential;
};

const ItwPresentationPidDetailFooter = ({ credential }: Props) => {
  const startAndTrackSupportRequest =
    useItwStartCredentialSupportRequest(credential);

  const requestAssistanceLabel = I18n.t(
    "features.itWallet.presentation.credentialDetails.actions.requestAssistance"
  );

  return (
    <View>
      <ListItemAction
        variant="primary"
        icon="message"
        label={requestAssistanceLabel}
        accessibilityLabel={requestAssistanceLabel}
        onPress={startAndTrackSupportRequest}
      />
      <ListItemAction
        variant="primary"
        icon="website"
        label={POWERED_BY_IT_WALLET}
        accessibilityLabel={POWERED_BY_IT_WALLET}
        onPress={constNull}
      />
      {/* TODO: add "remove from wallet" item */}
    </View>
  );
};

const MemoizedItwPresentationPidDetailFooter = memo(
  ItwPresentationPidDetailFooter
);
export { MemoizedItwPresentationPidDetailFooter as ItwPresentationPidDetailFooter };
