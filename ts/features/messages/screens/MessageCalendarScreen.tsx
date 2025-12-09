import {
  FooterActions,
  ModalBSHeader,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useRoute } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Calendar } from "react-native-calendar-events";
import I18n from "i18next";
import { CalendarList } from "../../../components/CalendarList";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import { findDeviceCalendarsTask } from "../../../utils/calendar";
import { useMessageCalendar } from "../hooks/useMessageCalendar";
import { MessagesParamsList } from "../navigation/params";
import { messageDetailsByIdSelector } from "../store/reducers/detailsById";

export type MessageCalendarScreenRouteParams = {
  messageId: string;
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
          enableAnimatedPictogram
          pictogram={"umbrella"}
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
        <View style={{ flex: 1 }}>
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
      <FooterActions
        actions={{
          type: "SingleButton",
          primary: {
            label: I18n.t("global.buttons.cancel"),
            onPress: () => navigation.goBack()
          }
        }}
      />
    </>
  );
};
