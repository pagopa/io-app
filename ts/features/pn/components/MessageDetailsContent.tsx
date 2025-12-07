import { BodySmall } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIOSelector } from "../../../store/hooks";
import { aarAdresseeDenominationSelector } from "../aar/store/selectors";
import { sendShowAbstractSelector } from "../../../store/reducers/backendStatus/remoteConfig";
import { isTestEnv } from "../../../utils/environment";
import { SendUserType } from "../../pushNotifications/analytics";
import { IOReceivedNotification } from "../../../../definitions/pn/IOReceivedNotification";

export type MessageDetailsContentProps = {
  message: IOReceivedNotification;
  sendUserType: SendUserType;
};
export const MessageDetailsContent = ({
  message,
  sendUserType
}: MessageDetailsContentProps) => (
  <BodySmall>
    <MaybeDelegationText sendUserType={sendUserType} />
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

type MaybeDelegationTextProps = { sendUserType: SendUserType };
const MaybeDelegationText = ({ sendUserType }: MaybeDelegationTextProps) => {
  const aarAdresseeDenomination = useIOSelector(
    aarAdresseeDenominationSelector
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
