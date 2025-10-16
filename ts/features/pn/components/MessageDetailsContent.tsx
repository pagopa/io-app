import { BodySmall } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIOSelector } from "../../../store/hooks";
import { PNMessage } from "../store/types/types";
import {
  aarAdresseeDenominationSelector,
  isAarMessageDelegatedSelector
} from "../aar/store/selectors";

type MessageDetailsContentProps = { message: PNMessage };
export const MessageDetailsContent = ({
  message
}: MessageDetailsContentProps) => {
  const { senderDenomination } = message;

  const MaybeDenomination = () =>
    senderDenomination ? (
      <BodySmall weight="Regular">
        {I18n.t(
          "features.pn.aar.flow.displayingNotificationData.abstract.title.receivedFrom_withDenomination"
        )}
        <BodySmall weight="Semibold">{senderDenomination}</BodySmall>
      </BodySmall>
    ) : (
      <BodySmall>
        {I18n.t(
          "features.pn.aar.flow.displayingNotificationData.abstract.title.receivedFrom_withoutDenomination"
        )}
      </BodySmall>
    );

  return (
    <BodySmall>
      <MaybeDelegationText iun={message.iun} />
      <MaybeDenomination />
      {I18n.t(
        "features.pn.aar.flow.displayingNotificationData.abstract.title.checkDocuments"
      )}
    </BodySmall>
  );
};

type MaybeDelegationTextProps = { iun: string };
const MaybeDelegationText = ({ iun }: MaybeDelegationTextProps) => {
  const aarAdresseeDenomination = useIOSelector(state =>
    aarAdresseeDenominationSelector(state, iun)
  );
  const isDelegatedAarMessage = useIOSelector(state =>
    isAarMessageDelegatedSelector(state, iun)
  );
  if (!isDelegatedAarMessage) {
    return (
      <>
        {I18n.t(
          "features.pn.aar.flow.displayingNotificationData.abstract.title.notDelegated.youHave"
        )}
      </>
    );
  }
  return aarAdresseeDenomination ? (
    <>
      <BodySmall weight="Semibold">{aarAdresseeDenomination}</BodySmall>
      {I18n.t(
        "features.pn.aar.flow.displayingNotificationData.abstract.title.delegated.theyHave"
      )}
    </>
  ) : (
    <></>
  );
};
