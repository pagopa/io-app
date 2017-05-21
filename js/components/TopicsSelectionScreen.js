/**
 * Implements the screen for choosing notification topics.
 *
 * @providesModule TopicsSelectionScreen
 * @flow
 *
 */

'use strict'

const React = require('React')

import {
	StyleSheet,
} from 'react-native'

import {
  Container,
  Content,
  Header,
  Text,
  Left, Right,
  Icon,
  Button,
  Body,
  Item,
  Input,
  ListItem,
  CheckBox,
  Switch,
} from 'native-base'

import type { NavigationScreenProp } from 'react-navigation/src/TypeDefinition'
import type { Dispatch, AnyAction } from '../actions/types'
import type { LoggedInUserState } from '../reducers/user'

import { ProfileStyles } from './styles'

type Topic = {
  name: string,
  label: string,
}

type TopicCategory = {
  name: string,
  label: string,
  topics: Array<TopicType>,
}

const categories: Array<TopicCategory> = [
  {
    name: 'scadenze',
    label: 'SCADENZE',
    topics: [
      {
        name: 'fiscali',
        label: 'Fiscali',
      },
      {
        name: 'amministrative',
        label: 'Amministrative',
      },
      {
        name: 'altro',
        label: 'Altro',
      },
    ]
  },
  {
    name: 'avvisi',
    label: 'AVVISI',
    topics: [
      {
        name: 'fiscali',
        label: 'Fiscali',
      },
      {
        name: 'amministrativi',
        label: 'Amministrativi',
      },
      {
        name: 'circolazione',
        label: 'Circolazione',
      },
      {
        name: 'eventi',
        label: 'Eventi',
      },
      {
        name: 'altro',
        label: 'Altro',
      },
    ]
  }
]

class TopicsSelectionScreen extends React.Component {

  props: {
    navigation: NavigationScreenProp<*,AnyAction>,
    dispatch: Dispatch,
    user: LoggedInUserState,
  }

  state: {
    isSelectionChanged: boolean
  }

  constructor(props: any) {
    super(props)
    this.state = {
      isSelectionChanged: false,
    }
  }

  renderTopicElements(categories: Array<TopicCategory>) {
    return categories.map((category, categoryIdx) => {
      const isFirstCategory = categoryIdx == 0
      const isLastCategory = categoryIdx == (categories.length - 1)
      const topicElements = category.topics.map((topic, topicIdx, topics) => {
        const isLastTopic = topicIdx == (topics.length - 1)
        return(
          <ListItem icon last={isLastCategory && isLastTopic}>
            <Body>
              <Text onPress={() => { }}>{topic.label}</Text>
            </Body>
            <Right>
              <Switch value={true} />
            </Right>
          </ListItem>
        )
      })
      return ([
        <ListItem itemHeader first={isFirstCategory}>
          <Text style={StyleSheet.flatten(ProfileStyles.preferenceHeaderText)}>{category.label}</Text>
        </ListItem>
      ].concat(topicElements))
    })
  }

  render() {
    return(
      <Container>
        <Header style={{alignItems: 'center'}}>
          <Left>
            <Button transparent onPress={() => {
              this.props.navigation.goBack()
            }}>
            <Icon name="chevron-left" />
            </Button>
          </Left>
          <Text style={{color: '#fff', fontSize: 20}}>AVVISI E SCADENZE</Text>
          <Right>
          </Right>
        </Header>
        <Content style={{backgroundColor: '#fff'}}>
          { this.renderTopicElements(categories) }
        </Content>
      </Container>
    )
  }

}

module.exports = TopicsSelectionScreen
