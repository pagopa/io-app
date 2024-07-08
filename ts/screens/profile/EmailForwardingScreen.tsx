/**
 * A screens to express the preferences related to email forwarding.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import {
  ContentWrapper,
  ListItemSwitch,
  useIOToast
} from "@pagopa/io-app-design-system";
import _ from "lodash";
import { IOScrollViewWithLargeHeader } from "../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../i18n";
import { BodyProps } from "../../components/core/typography/ComposedBodyFromArray";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import {
  isEmailEnabledSelector,
  profileEmailSelector,
  profileSelector
} from "../../store/reducers/profile";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import { profileUpsert } from "../../store/actions/profile";
import { customEmailChannelSetEnabled } from "../../store/actions/persistedPreferences";
import { usePrevious } from "../../utils/hooks/usePrevious";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.preferences.email.forward.contextualHelpTitle",
  body: "profile.preferences.email.forward.contextualHelpContent"
};

const EmailForwardingScreen = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isCustomChannelEnabledChoice = useRef<boolean | undefined>(undefined);
  const IOToast = useIOToast();
  const dispatch = useIODispatch();
  const profile = useIOSelector(profileSelector, _.isEqual);
  const prevProfile = usePrevious(profile);
  const isEmailEnabled = useIOSelector(isEmailEnabledSelector, _.isEqual);
  const UserEmailSelector = useIOSelector(profileEmailSelector, _.isEqual);
  const userEmail = pipe(
    UserEmailSelector,
    O.fold(
      () => I18n.t("global.remoteStates.notAvailable"),
      (i: string) => i
    )
  );

  const setEmailChannel = useCallback(
    (isEmailEnabled: boolean) => {
      dispatch(
        profileUpsert.request({
          is_email_enabled: isEmailEnabled
        })
      );
    },
    [dispatch]
  );

  const setCustomEmailChannelEnabled = useCallback(
    (customEmailChannelEnabled: boolean) => {
      dispatch(customEmailChannelSetEnabled(customEmailChannelEnabled));
    },
    [dispatch]
  );

  const disableOrEnableAllEmailNotifications = useCallback(
    () =>
      dispatch(
        profileUpsert.request({
          blocked_inbox_or_channels: {},
          is_email_enabled: true
        })
      ),
    [dispatch]
  );

  const bodyPropsArray: Array<BodyProps> = [
    {
      text: I18n.t("send_email_messages.subtitle")
    },
    {
      text: <> {userEmail}</>,
      weight: "Semibold"
    },
    {
      text: I18n.t("global.symbols.question")
    }
  ];

  const handleSwitchValueChange = useCallback(
    (canSendEmail: boolean) => {
      setIsLoading(true);
      // eslint-disable-next-line functional/immutable-data
      isCustomChannelEnabledChoice.current = false;
      if (canSendEmail) {
        disableOrEnableAllEmailNotifications();
      } else {
        setEmailChannel(false);
      }
    },
    [disableOrEnableAllEmailNotifications, setEmailChannel]
  );

  useEffect(() => {
    if (prevProfile && pot.isUpdating(prevProfile)) {
      // if we got an error while updating the preference
      // show a toast
      if (pot.isError(profile)) {
        IOToast.error(I18n.t("global.genericError"));
        setIsLoading(false);
        return;
      }
      // TODO move this login into a dedicated saga https://www.pivotaltracker.com/story/show/171600688
      // if the profile updating is successfully then apply isCustomChannelEnabledChoice
      if (
        pot.isSome(profile) &&
        isCustomChannelEnabledChoice.current !== undefined
      ) {
        setCustomEmailChannelEnabled(isCustomChannelEnabledChoice.current);
        setIsLoading(false);
        return;
      }
    }
  }, [IOToast, profile, prevProfile, setCustomEmailChannelEnabled]);

  return (
    <IOScrollViewWithLargeHeader
      title={{ label: I18n.t("send_email_messages.title") }}
      description={bodyPropsArray}
      headerActionsProp={{ showHelp: true }}
      contextualHelpMarkdown={contextualHelpMarkdown}
      canGoback={true}
    >
      <ContentWrapper>
        <ListItemSwitch
          label={I18n.t("send_email_messages.switch.title")}
          description={I18n.t("send_email_messages.switch.subtitle")}
          onSwitchValueChange={handleSwitchValueChange}
          value={isEmailEnabled}
          isLoading={isLoading}
        />
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

export default EmailForwardingScreen;
