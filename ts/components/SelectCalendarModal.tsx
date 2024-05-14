import React from "react";
import {
  View,
  BackHandler,
  NativeEventSubscription,
  StyleSheet,
  ScrollView
} from "react-native";
import { Calendar } from "react-native-calendar-events";

import { connect } from "react-redux";
import {
  FooterWithButtons,
  IOColors,
  IOStyles
} from "@pagopa/io-app-design-system";
import I18n from "../i18n";
import { GlobalState } from "../store/reducers/types";
import CalendarsListContainer from "./CalendarsListContainer";
import { Body } from "./core/typography/Body";
import ItemSeparatorComponent from "./ItemSeparatorComponent";
import LoadingSpinnerOverlay from "./LoadingSpinnerOverlay";
import { ScreenContentHeader } from "./screens/ScreenContentHeader";

type Props = ReturnType<typeof mapStateToProps> & {
  onCancel: () => void;
  onCalendarSelected: (calendar: Calendar) => void;
};

const styles = StyleSheet.create({
  content: {
    paddingTop: 48
  }
});

type State = {
  isLoading: boolean;
};
/**
 * A modal that allow the user to select one of the device available Calendars
 */
class SelectCalendarModal extends React.PureComponent<Props, State> {
  private subscription: NativeEventSubscription | undefined;
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true
    };
  }
  private onBackPress = () => {
    this.props.onCancel();
    // Returning true is mandatory to avoid the default press action to be
    // triggered as if the modal was not visible
    return true;
  };

  private onCalendarsLoaded = () => {
    this.setState({ isLoading: false });
  };

  public render() {
    const { isLoading } = this.state;
    return (
      <LoadingSpinnerOverlay isLoading={isLoading}>
        <View style={{ ...IOStyles.flex, backgroundColor: IOColors.white }}>
          <ScrollView style={styles.content}>
            <ScreenContentHeader
              title={I18n.t("messages.cta.reminderCalendarSelect")}
            />
            <CalendarsListContainer
              onCalendarSelected={this.props.onCalendarSelected}
              onCalendarsLoaded={this.onCalendarsLoaded}
              lastListItem={
                this.props.defaultCalendar === undefined && (
                  <View>
                    <ItemSeparatorComponent />
                    <Body>{I18n.t("messages.cta.helper")}</Body>
                  </View>
                )
              }
            />
          </ScrollView>
          {!isLoading && (
            <FooterWithButtons
              type="SingleButton"
              primary={{
                type: "Outline",
                buttonProps: {
                  onPress: this.props.onCancel,
                  label: I18n.t("global.buttons.cancel"),
                  accessibilityLabel: I18n.t("global.buttons.cancel")
                }
              }}
            />
          )}
        </View>
      </LoadingSpinnerOverlay>
    );
  }

  public componentDidMount() {
    // eslint-disable-next-line functional/immutable-data
    this.subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      this.onBackPress
    );
  }

  public componentWillUnmount() {
    this.subscription?.remove();
  }
}

const mapStateToProps = (state: GlobalState) => ({
  defaultCalendar: state.persistedPreferences.preferredCalendar
});

export default connect(mapStateToProps)(SelectCalendarModal);
