import * as React from 'react'
import {connect} from 'react-redux'
import {NavigationScreenProp, NavigationState} from 'react-navigation'
import {Container, Content, Text, Body, H1, Item, View} from 'native-base'
import {ReduxProps} from '../../actions/types'
import AppHeader from '../../components/ui/AppHeader'
import I18n from "../../i18n";
import {GlobalState} from "../../reducers/types"
import {MessagesState} from "../../store/reducers/messages"
import {getAllMessagesById} from "../../store/reducers/messages"
import {ObjectListOfNormalizedMessages} from "../../store/reducers/messages"
import MessageComponent from "../../components/MessageComponent"

type ReduxMappedProps = {
  messagesById: ObjectListOfNormalizedMessages | MessagesState
}
export type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>
}
type Props = ReduxMappedProps & ReduxProps & OwnProps

/**
 * This screen show the messages to the authenticated user.
 */
class MessagesScreen extends React.Component<Props, never> {
  constructor(props: Props) {
    super(props)
  }

  renderMessageList(list) {
    return Object.keys(list).map((key) => {
      console.log(list[key]);
        return (
          <MessageComponent key={key} sender={list[key].sender_service_id} subject={list[key].content.subject} date={list[key].date}/>
        )
      }
    )

  }

  componentDidMount() {
    this.props.dispatch({
      type: 'MESSAGES_LOAD_REQUEST'
    });
  }

  render() {

    const {messagesById} = this.props;


    return (
      <Container>
        <AppHeader>
          <Body>
          <Text>{I18n.t('messages.headerTitle')}</Text>
          </Body>
        </AppHeader>
        <Content>
          <H1>
            {I18n.t('messages.contentTitle')}
          </H1>
          <View spacer large />
          {
            Object.keys(messagesById).length !== 0 ? (this.renderMessageList(messagesById)) :
              (<Text>{I18n.t('messages.loading')}</Text>)
          }
        </Content>
      </Container>
    )
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  messagesById: getAllMessagesById(state.messages)
})

export default connect(mapStateToProps)(MessagesScreen)
