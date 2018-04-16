// @flow

import * as React from 'react'
import { connect } from 'react-redux'
import {
  type NavigationScreenProp,
  type NavigationState
} from 'react-navigation'
import {
  Container,
  Content,
  Text,
  View,
  Button,
  Icon,
  Left,
  Body,
  H1
} from 'native-base'
import CodeInput from 'react-native-confirmation-code-input'

import { type ReduxProps } from '../../actions/types'
import I18n from '../../i18n'
import AppHeader from '../../components/ui/AppHeader'
import { createPin } from '../../store/actions/onboarding'

type ReduxMappedProps = {}

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>
}

type Props = ReduxMappedProps & ReduxProps & OwnProps

type State = {
  pin?: string,
  isPinConfirmed: boolean
}

/**
 * A screen that allow the user to set the PIN.
 */
class PinScreen extends React.Component<Props, State> {
  pinComponent: React.ElementRef<typeof CodeInput>
  pinConfirmComponent: React.ElementRef<typeof CodeInput>

  state = {
    pin: undefined,
    isPinConfirmed: false
  }

  onPinFulfill = (code: string) => {
    if (this.pinComponent) {
      this.pinComponent.clear()
    }
    this.setState({
      pin: code
    })
  }

  onPinConfirmFulfill = (isValid: boolean) => {
    if (!isValid) {
      if (this.pinConfirmComponent) {
        this.pinConfirmComponent.clear()
      }
    }
    this.setState({
      isPinConfirmed: isValid
    })
  }

  onPinReset = () => {
    if (this.pinConfirmComponent) {
      this.pinConfirmComponent.clear()
    }
    this.setState({
      pin: undefined,
      isPinConfirmed: false
    })
  }

  createPin = (pin: string) => {
    this.props.dispatch(createPin(pin))
  }

  renderPINComponent = (): React.Node => {
    return (
      <CodeInput
        ref={(el: React.ElementRef<typeof CodeInput>): void =>
          (this.pinComponent = el)
        }
        secureTextEntry
        keyboardType="numeric"
        autoFocus
        className="border-b"
        codeLength={5}
        cellBorderWidth={2}
        inactiveColor={'rgba(92,111,130,0.5)'}
        activeColor={'rgba(23,50,77,1)'}
        onFulfill={this.onPinFulfill}
        codeInputStyle={{ fontSize: 24, height: 56 }}
      />
    )
  }

  renderPINConfirmComponent = (pin: string): React.Node => {
    return (
      <CodeInput
        ref={(el: React.ElementRef<typeof CodeInput>): void =>
          (this.pinConfirmComponent = el)
        }
        secureTextEntry
        keyboardType="numeric"
        autoFocus
        compareWithCode={pin}
        className="border-b"
        codeLength={5}
        cellBorderWidth={2}
        inactiveColor={'rgba(92,111,130,0.5)'}
        activeColor={'rgba(23,50,77,1)'}
        onFulfill={this.onPinConfirmFulfill}
        codeInputStyle={{ fontSize: 24, height: 56 }}
      />
    )
  }

  render(): React.Node {
    const { pin, isPinConfirmed } = this.state
    return (
      <Container>
        <AppHeader>
          <Left>
            <Button
              transparent
              onPress={(): boolean => this.props.navigation.goBack()}
            >
              <Icon name="chevron-left" />
            </Button>
          </Left>
          <Body>
            <Text>{I18n.t('onboarding.tos.headerTitle')}</Text>
          </Body>
        </AppHeader>
        <Content>
          <H1>
            {I18n.t(
              pin
                ? 'onboarding.pin.contentTitleConfirm'
                : 'onboarding.pin.contentTitle'
            )}
          </H1>
          <View spacer extralarge />
          {pin
            ? this.renderPINConfirmComponent(pin)
            : this.renderPINComponent()}

          <View spacer extralarge />
          <View spacer large />

          <View centered>
            {isPinConfirmed && <Icon name={'check'} big success />}
          </View>

          <View spacer extralarge />

          <Text>{I18n.t('onboarding.pin.pinInfo')}</Text>
          <Text link>{I18n.t('onboarding.pin.moreLinkText')}</Text>
        </Content>
        <View footer>
          <Button
            block
            primary
            disabled={!isPinConfirmed}
            onPress={() => this.createPin(this.state.pin)}
          >
            <Text>{I18n.t('onboarding.pin.continue')}</Text>
          </Button>
          {pin && <View spacer />}
          {pin && (
            <Button block bordered onPress={this.onPinReset}>
              <Text>{I18n.t('onboarding.pin.reset')}</Text>
            </Button>
          )}
        </View>
      </Container>
    )
  }
}

export default connect()(PinScreen)
