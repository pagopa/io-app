import { BodySmall } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIOSelector } from "../../../store/hooks";
import { PNMessage } from "../store/types/types";
import {
  aarAdresseeDenominationSelector,
  isAarMessageDelegatedSelector
} from "../aar/store/selectors";
import { sendShowAbstractSelector } from "../../../store/reducers/backendStatus/remoteConfig";

type MessageDetailsContentProps = { message: PNMessage };
export const MessageDetailsContent = ({
  message
}: MessageDetailsContentProps) => (
  <BodySmall>
    <MaybeDelegationText iun={message.iun} />
    <MaybeDenomination senderDenomination={message.senderDenomination} />
    {I18n.t(
      "features.pn.aar.flow.displayingNotificationData.abstract.title.checkDocuments"
    )}
    <MaybeAbstract abstract={message.abstract} />
  </BodySmall>
);

// ---------------- Subcomponents ----------------

type MaybeDenominationProps = { senderDenomination: string | undefined };
const MaybeDenomination = ({ senderDenomination }: MaybeDenominationProps) =>
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

type MaybeAbstractProps = { abstract: string | undefined };
const MaybeAbstract = ({ abstract }: MaybeAbstractProps) => {
  const shouldShowAbstract = useIOSelector(sendShowAbstractSelector);
  const isEmptyAbstract = abstract == null || abstract.trim().length === 0;

  if (shouldShowAbstract && !isEmptyAbstract) {
    return <BodySmall>{`\n\n${abstract}`}</BodySmall>;
  }
  return <></>;
};
