import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Calendar } from "react-native-calendar-events";
import { RouteProp, useRoute } from "@react-navigation/native";
import {
  FooterWithButtons,
  IOStyles,
  ModalBSHeader,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import I18n from "../../../i18n";
import { UIMessageId } from "../types";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { MessagesParamsList } from "../navigation/params";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { CalendarList } from "../../../components/CalendarList";
import { useIOSelector } from "../../../store/hooks";
import { findDeviceCalendarsTask } from "../../../utils/calendar";
import { messageDetailsByIdSelector } from "../store/reducers/detailsById";
import { useMessageCalendar } from "../hooks/useMessageCalendar";

export type MessageCalendarScreenRouteParams = {
  messageId: UIMessageId;
};

type MessageCalendarRouteProps = RouteProp<
  MessagesParamsList,
  "MESSAGE_DETAIL_CALENDAR"
>;

const MessageCalendarHeaderComponent = () => {
  const navigation = useIONavigation();
  const onClose = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <ModalBSHeader
      title={I18n.t("messages.cta.reminderCalendarSelect")}
      onClose={onClose}
      closeAccessibilityLabel={I18n.t("global.buttons.close")}
    />
  );
};
export const MessageCalendarScreen = () => {
  const [calendarsByAccount, setCalendarsByAccount] = useState<
    pot.Pot<Array<Calendar>, Error>
  >(pot.noneLoading);

  const { params } = useRoute<MessageCalendarRouteProps>();
  const { messageId } = params;

  const navigation = useIONavigation();

  const messageDetails = useIOSelector(state =>
    messageDetailsByIdSelector(state, messageId)
  );

  const { addEventToCalendar, setPreferredCalendar } =
    useMessageCalendar(messageId);

  const handleCalendarSelected = useCallback(
    (calendar: Calendar) => {
      pipe(
        messageDetails,
        pot.toOption,
        O.map(({ subject, dueDate }) => {
          if (!dueDate) {
            return;
          }
          addEventToCalendar(dueDate, subject, calendar);
          setPreferredCalendar(calendar);
          navigation.goBack();
        })
      );
    },
    [messageDetails, addEventToCalendar, setPreferredCalendar, navigation]
  );

  const fetchCalendars = useCallback(async () => {
    setCalendarsByAccount(pot.noneLoading);

    void pipe(
      findDeviceCalendarsTask,
      TE.map(calendars => {
        setCalendarsByAccount(pot.some(calendars));
      }),
      TE.mapLeft(error => {
        setCalendarsByAccount(pot.toError(pot.none, error));
      })
    )();
  }, []);

  useEffect(() => {
    void fetchCalendars();
  }, [fetchCalendars]);

  if (pot.isError(calendarsByAccount)) {
    return (
      <>
        <MessageCalendarHeaderComponent />
        <OperationResultScreenContent
          pictogram={"umbrellaNew"}
          title={I18n.t("messages.cta.errors.fetchCalendars")}
          action={{
            label: I18n.t("global.buttons.retry"),
            accessibilityLabel: I18n.t("global.buttons.retry"),
            onPress: fetchCalendars
          }}
        />
      </>
    );
  }

  return (
    <>
      <MessageCalendarHeaderComponent />
      <ScrollView>
        <VSpacer size={16} />
        <View style={IOStyles.flex}>
          <CalendarList
            calendars={pipe(
              calendarsByAccount,
              pot.toOption,
              O.getOrElse<Array<Calendar>>(() => [])
            )}
            isLoading={pot.isLoading(calendarsByAccount)}
            onCalendarSelected={handleCalendarSelected}
          />
        </View>
      </ScrollView>
      <FooterWithButtons
        type="SingleButton"
        primary={{
          type: "Outline",
          buttonProps: {
            label: I18n.t("global.buttons.cancel"),
            accessibilityLabel: I18n.t("global.buttons.cancel"),
            onPress: () => navigation.goBack()
          }
        }}
      />
    </>
  );
};
