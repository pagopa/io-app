import * as React from 'react'
import { Item, Text, View, Icon } from 'native-base'
import { connectStyle } from 'native-base-shoutem-theme'
import { Theme } from '../theme/types'
import { StyleSheet } from "react-native";


export type OwnProps = {
  sender: string,
  subject: string,
  key: string,
  date: string,
  style: Theme
}
export type Props = OwnProps

/**
 * Implements a component that show a message in the MessagesScreen List
 */
class MessageComponent extends React.PureComponent<Props> {
  render() {
    const {subject,sender,date} = this.props;
    const styles = this.props.style;

    return (

      <Item spacer style={styles}>
        <View style={customStyle.titleView}>
          <Text bold style={customStyle.titleText}>{sender}</Text>
          <Text dateFormat style={customStyle.dataText}> {date} </Text>
        </View>
        <View style={customStyle.subjectView}>
          <Text style={customStyle.subjectText}>{subject}</Text>
          <Icon name="chevron-right" style={customStyle.subjectIconArrow}/>
        </View>
      </Item>


    )
  }
}

const customStyle = StyleSheet.create({
  titleView: {
    flexDirection: 'row'
  },
  titleText: {
    flex:1
  },
  dataText:{
    flex:0
  },
  subjectView: {
    flexDirection: 'row',
    paddingBottom:20
  },
  subjectText: {
    flex:1
  },
  subjectIconArrow: {
    flex:0,
    color: '#0073E6',
    alignSelf: 'center'

  }
})



export default connectStyle('NativeBase.MessageComponent', customStyle)(MessageComponent);

