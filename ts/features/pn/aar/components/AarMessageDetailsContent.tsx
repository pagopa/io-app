import { BodySmall } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useIOSelector } from "../../../../store/hooks";
import { PNMessage } from "../../store/types/types";
import { isAarMessageDelegatedSelector } from "../store/selectors";
export const AarMessageDetailsContent = ({
  message
}: {
  message: PNMessage;
}) => {
  const isDelegated = useIOSelector(state =>
    isAarMessageDelegatedSelector(state, message.iun)
  );
  const senderDenomination = message.senderDenomination;

  const MaybeDelegationText = () =>
    isDelegated ? (
      <>
        <BodySmall weight="Semibold">
          {message.recipients[0].denomination}
        </BodySmall>
        {I18n.t(
          "features.pn.aar.flow.displayingNotificationData.abstract.title.delegated.theyHave"
        )}
      </>
    ) : (
      <>
        {I18n.t(
          "features.pn.aar.flow.displayingNotificationData.abstract.title.notDelegated.youHave"
        )}
      </>
    );

  const MaybeDenomination = () =>
    senderDenomination ? (
      <BodySmall weight="Semibold">{senderDenomination}</BodySmall>
    ) : (
      ""
    );

  return (
    <BodySmall>
      <MaybeDelegationText />
      {I18n.t(
        "features.pn.aar.flow.displayingNotificationData.abstract.title.receivedFrom"
      )}
      <MaybeDenomination />
      {I18n.t(
        "features.pn.aar.flow.displayingNotificationData.abstract.title.checkDocuments"
      )}
    </BodySmall>
  );
};
