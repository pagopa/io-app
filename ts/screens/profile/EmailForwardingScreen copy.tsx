import React, { useCallback, useState } from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { ContentWrapper, ListItemSwitch } from "@pagopa/io-app-design-system";
import { IOScrollViewWithLargeHeader } from "../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../i18n";
import {
  BodyProps,
  ComposedBodyFromArray
} from "../../components/core/typography/ComposedBodyFromArray";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import {
  ProfileState,
  isEmailEnabledSelector,
  profileEmailSelector,
  profileSelector
} from "../../store/reducers/profile";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import { profileUpsert } from "../../store/actions/profile";
import { customEmailChannelSetEnabled } from "../../store/actions/persistedPreferences";
import { getProfileChannelsforServicesList } from "../../utils/profile";
import {
  VisibleServicesState,
  visibleServicesSelector
} from "../../store/reducers/entities/services/visibleServices";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.preferences.email.forward.contextualHelpTitle",
  body: "profile.preferences.email.forward.contextualHelpContent"
};

const EmailForwardingScreen = () => {
  const [value, setValue] = useState<boolean>(false);
  const dispatch = useIODispatch();
  const potProfile = useIOSelector(profileSelector);
  const potVisibleServices: VisibleServicesState = useIOSelector(
    visibleServicesSelector
  );
  const visibleServicesId = pot.getOrElse(
    pot.map(potVisibleServices, services =>
      services.map(service => service.service_id)
    ),
    []
  );
  const isLoading = pot.isLoading(potProfile) || pot.isUpdating(potProfile);
  const isEmailEnabled = useIOSelector(isEmailEnabledSelector);
  const potUserEmail = useIOSelector(profileEmailSelector);
  const userEmail = pipe(
    potUserEmail,
    O.fold(
      () => I18n.t("global.remoteStates.notAvailable"),
      (i: string) => i
    )
  );

  const setEmailChannel = useCallback((isEmailEnabled: boolean) => {
    dispatch(
      profileUpsert.request({
        is_email_enabled: isEmailEnabled
      })
    );
  }, []);

  const setCustomEmailChannelEnabled = useCallback(
    (customEmailChannelEnabled: boolean) => {
      dispatch(customEmailChannelSetEnabled(customEmailChannelEnabled));
    },
    []
  );

  const disableOrEnableAllEmailNotifications = useCallback(
    (servicesId: ReadonlyArray<string>, profile: ProfileState) => {
      const newBlockedChannels = getProfileChannelsforServicesList(
        servicesId,
        profile,
        true,
        "EMAIL"
      );
      dispatch(
        profileUpsert.request({
          blocked_inbox_or_channels: newBlockedChannels,
          is_email_enabled: true
        })
      );
    },
    []
  );

  const bodyPropsArray: Array<BodyProps> = [
    {
      text: "Vuoi che IO inoltri un’anteprima dei messaggi all’indirizzo"
    },
    {
      text: <> {userEmail}</>,
      weight: "Semibold"
    },
    {
      text: I18n.t("global.symbols.question")
    }
  ];

  const handleSwitchValueChange = useCallback((canSendEmail: boolean) => {
    setValue(canSendEmail);
    if (canSendEmail) {
      disableOrEnableAllEmailNotifications(visibleServicesId, potProfile);
    } else {
      setEmailChannel(false);
    }
  }, []);

  return (
    <IOScrollViewWithLargeHeader
      title={{ label: I18n.t("send_email_messages.title") }}
      description={
        (<ComposedBodyFromArray body={bodyPropsArray} />) as unknown as string
      }
      headerActionsProp={{ showHelp: true }}
      contextualHelpMarkdown={contextualHelpMarkdown}
      canGoback={true}
    >
      <ContentWrapper>
        <ListItemSwitch
          label="Invia un’anteprima via email"
          description="Riceverai un'anteprima del messaggio al tuo indirizzo email, se il servizio lo consente."
          onSwitchValueChange={handleSwitchValueChange}
          value={value}
        />
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

export default EmailForwardingScreen;
