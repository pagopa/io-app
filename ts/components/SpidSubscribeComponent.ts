/**
 * @providesModule SpidSubscribeComponent
 */
import * as React from 'react'
import { Text, Icon, View, Item, Input } from 'native-base'
import EmailValidator from 'email-validator'
import I18n from '../i18n'
export type State = {
  isEmailValid: boolean
}
export type Props = {}
/**
 * Implements the component for helping the user to subscribe to SPID.
 */
export default class SpidSubscribeComponent extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props)
    this.state = {
      isEmailValid: false
    }
  }
  _onEmailChange(text: string) {
    this.setState({
      isEmailValid: EmailValidator.validate(text)
    })
  }
  render() {
    return (
      <View>
        <Text style={{ fontSize: 16, color: '#d4e4fb', marginTop: 5 }}>
          {I18n.t('spid.subscription.line1')}
        </Text>
        <Text style={{ fontSize: 16, color: '#fff', marginTop: 10 }}>
          {I18n.t('spid.subscription.line2')}
        </Text>
        <Item fixedLabel>
          <Input
            style={{ color: '#fff' }}
            placeholderTextColor="#7eb4eb"
            placeholder="io@email.it"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            returnKeyLabel="send"
            onChangeText={this._onEmailChange.bind(this)}
          />
          <Icon
            style={{ color: this.state.isEmailValid ? '#fff' : '#7eb4eb' }}
            name="check"
          />
        </Item>
      </View>
    )
  }
}
