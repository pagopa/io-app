import { Content, Text, View } from "native-base";
import React from "react";
import { Calendar } from "react-native-calendar-events";
import { connect } from "react-redux";
import I18n from "../i18n";
import { GlobalState } from "../store/reducers/types";
import CalendarsListContainer from "./CalendarsListContainer";
import ItemSeparatorComponent from "./ItemSeparatorComponent";
import LoadingSpinnerOverlay from "./LoadingSpinnerOverlay";
import { ScreenContentHeader } from "./screens/ScreenContentHeader";
import FooterWithButtons from "./ui/FooterWithButtons";
import BaseScreenComponent from './screens/BaseScreenComponent';

type Props = ReturnType<typeof mapStateToProps> & {
  onCancel: () => void;
  onCalendarSelected: (calendar: Calendar) => void;
};

type State = {
  isLoading: boolean;
};
/**
 * A modal that allow the user to select one of the device available Calendars
 */
class SelectCalendarModal extends React.PureComponent<Props, State> {
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
        <BaseScreenComponent isModal={true} goBack={this.onBackPress}>
          <Content noPadded={true}>
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
                    <Text>{I18n.t("messages.cta.helper")}</Text>
                  </View>
                )
              }
            />
          </Content>
          {!isLoading && (
            <FooterWithButtons
              type="SingleButton"
              leftButton={{
                bordered: true,
                onPress: this.props.onCancel,
                title: I18n.t("global.buttons.cancel"),
                block: true
              }}
            />
          )}
        </BaseScreenComponent>
      </LoadingSpinnerOverlay>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  defaultCalendar: state.persistedPreferences.preferredCalendar
});

export default connect(mapStateToProps)(SelectCalendarModal);
