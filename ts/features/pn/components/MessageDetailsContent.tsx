import { BodySmall } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIOSelector } from "../../../store/hooks";
import { PNMessage } from "../store/types/types";
import { aarAdresseeDenominationSelector } from "../aar/store/selectors";
import { sendShowAbstractSelector } from "../../../store/reducers/backendStatus/remoteConfig";
import { isTestEnv } from "../../../utils/environment";
import { SendUserType } from "../../pushNotifications/analytics";

export type MessageDetailsContentProps = {
  message: PNMessage;
  sendUserType: SendUserType;
};
export const MessageDetailsContent = ({
  message,
  sendUserType
}: MessageDetailsContentProps) => (
  <BodySmall>
    <MaybeDelegationText iun={message.iun} sendUserType={sendUserType} />
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

type MaybeDelegationTextProps = { iun: string; sendUserType: SendUserType };
const MaybeDelegationText = ({
  iun,
  sendUserType
}: MaybeDelegationTextProps) => {
  const aarAdresseeDenomination = useIOSelector(state =>
    aarAdresseeDenominationSelector(state, iun)
  );
  if (sendUserType !== "mandatory") {
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
    return <BodySmall testID="abstract">{`\n\n${abstract}`}</BodySmall>;
  }
  return <></>;
};

export const testable = isTestEnv ? { MaybeAbstract } : undefined;
