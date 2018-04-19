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
import color from 'color'

import { type ReduxProps } from '../../actions/types'
import { type GlobalState } from '../../reducers/types'
import I18n from '../../i18n'
import variables from '../../theme/variables'
import AppHeader from '../../components/ui/AppHeader'
import TextWithIcon from '../../components/ui/TextWithIcon'
import { createPin } from '../../store/actions/onboarding'
import { createErrorSelector } from '../../store/reducers/error'

type ReduxMappedProps = {
  pinSaveError: ?string
}

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>
}

type Props = ReduxMappedProps & ReduxProps & OwnProps

type PinUnselected = {
  state: 'PinUnselected'
}

type PinSelected = {
  state: 'PinSelected',
  // User selected PIN
  pin: string
}

type PinConfirmed = {
  state: 'PinConfirmed',
  pin: string,
  // True if the confirmation PIN do not match
  hasError: boolean
}

type PinState = PinUnselected | PinSelected | PinConfirmed

type State = {
  pinState: PinState
}

/**
 * A screen that allow the user to set the PIN.
 */
class PinScreen extends React.Component<Props, State> {
  pinComponent: React.ElementRef<typeof CodeInput>
  pinConfirmComponent: React.ElementRef<typeof CodeInput>

  // Initial state with PinUnselected
  state = {
    pinState: {
      state: 'PinUnselected'
    }
  }

  // Method called when the first CodeInput is filled
  onPinFulfill = (code: string) => {
    if (this.pinComponent) {
      this.pinComponent.clear()
    }
    this.setState({
      pinState: {
        state: 'PinSelected',
        pin: code
      }
    })
  }

  // Method called when the confirmation CodeInput is filled
  onPinConfirmFulfill = (isValid: boolean, code: string) => {
    if (!isValid) {
      if (this.pinConfirmComponent) {
        this.pinConfirmComponent.clear()
      }
    }
    this.setState({
      pinState: {
        state: 'PinConfirmed',
        pin: code,
        hasError: !isValid
      }
    })
  }

  onPinReset = () => {
    if (this.pinConfirmComponent) {
      this.pinConfirmComponent.clear()
    }
    this.setState({
      pinState: {
        state: 'PinUnselected'
      }
    })
  }

  // Dispatch the Action that save the PIn in the Keychain
  createPin = (pin: string) => {
    this.props.dispatch(createPin(pin))
  }

  // Render a different header when the user need to confirm the PIN
  renderContentHeader = (pinState: PinState): React.Node => {
    if (pinState.state === 'PinUnselected') {
      return <H1>{I18n.t('onboarding.pin.contentTitle')}</H1>
    } else {
      return <H1>{I18n.t('onboarding.pin.contentTitleConfirm')}</H1>
    }
  }

  // Render the PIN match/doesn't match feedback message
  renderCodeInputConfirmValidation = (pinState: PinConfirmed): React.Node => {
    const validationMessage = pinState.hasError ? (
      <TextWithIcon danger>
        <Icon name={'cross'} />
        <Text>{I18n.t('onboarding.pin.confirmInvalid')}</Text>
      </TextWithIcon>
    ) : (
      <TextWithIcon success>
        <Icon name={'check'} />
        <Text>{I18n.t('onboarding.pin.confirmValid')}</Text>
      </TextWithIcon>
    )
    return (
      <React.Fragment>
        <View spacer extralarge />
        {validationMessage}
      </React.Fragment>
    )
  }

  // Render select/confirm CodeInput component
  renderCodeInput = (pinState: PinState): React.Node => {
    if (pinState.state === 'PinUnselected') {
      /**
       * The CodeInput component where the user SELECT the PIN.
       *
       * autofucus={false}
       * onFulfill={this.onPinFulfill}
       */
      return (
        <CodeInput
          ref={(el: React.ElementRef<typeof CodeInput>): void =>
            (this.pinComponent = el)
          }
          secureTextEntry
          keyboardType="numeric"
          autoFocus={false}
          className="border-b"
          codeLength={5}
          cellBorderWidth={2}
          inactiveColor={color(variables.brandLightGray)
            .rgb()
            .string()}
          activeColor={color(variables.brandDarkGray)
            .rgb()
            .string()}
          onFulfill={this.onPinFulfill}
          codeInputStyle={{ fontSize: variables.fontSize5, height: 56 }}
        />
      )
    } else {
      /**
       * The CodeInput component where the user CONFIRM the PIN.
       *
       * autofucus={true}
       * compareWithCode={pinState.pin}
       * onFulfill={this.onPinConfirmFulfill}
       * */
      return (
        <React.Fragment>
          <CodeInput
            ref={(el: React.ElementRef<typeof CodeInput>): void =>
              (this.pinConfirmComponent = el)
            }
            secureTextEntry
            keyboardType="numeric"
            autoFocus
            compareWithCode={pinState.pin}
            className="border-b"
            codeLength={5}
            cellBorderWidth={2}
            inactiveColor={color(variables.brandLightGray)
              .rgb()
              .string()}
            activeColor={color(variables.brandDarkGray)
              .rgb()
              .string()}
            onFulfill={this.onPinConfirmFulfill}
            codeInputStyle={{ fontSize: variables.fontSize5, height: 56 }}
          />

          {pinState.state === 'PinConfirmed' &&
            this.renderCodeInputConfirmValidation(pinState)}
        </React.Fragment>
      )
    }
  }

  // The Content of the Screen
  renderContent = (pinState: PinState): React.Node => {
    return (
      <Content>
        {this.renderContentHeader(pinState)}

        <View spacer extralarge />

        {this.renderCodeInput(pinState)}

        <View spacer extralarge />

        <Text>{I18n.t('onboarding.pin.pinInfo')}</Text>
        <Text link>{I18n.t('onboarding.pin.moreLinkText')}</Text>
      </Content>
    )
  }

  renderContinueButton = (pinState: PinState): React.Node => {
    if (pinState.state === 'PinConfirmed') {
      const { pin, hasError } = pinState
      return (
        <Button
          block
          primary
          disabled={hasError}
          onPress={(): void => this.createPin(pin)}
        >
          <Text>{I18n.t('onboarding.pin.continue')}</Text>
        </Button>
      )
    } else {
      return (
        <Button block primary disabled>
          <Text>{I18n.t('onboarding.pin.continue')}</Text>
        </Button>
      )
    }
  }

  // The Footer of the Screen
  renderFooter = (pinState: PinState): React.Node => {
    return (
      <View footer>
        {this.renderContinueButton(pinState)}

        {pinState.state !== 'PinUnselected' && (
          <React.Fragment>
            <View spacer />

            <Button block bordered onPress={this.onPinReset}>
              <Text>{I18n.t('onboarding.pin.reset')}</Text>
            </Button>
          </React.Fragment>
        )}
      </View>
    )
  }

  render(): React.Node {
    const { pinState } = this.state

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
        {this.renderContent(pinState)}
        {this.renderFooter(pinState)}
      </Container>
    )
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  // Checks from the store whether there was an error while creating the PIN (e.g. saving into the Keystore)
  pinSaveError: createErrorSelector(['PIN_CREATE'])(state)
})

export default connect(mapStateToProps)(PinScreen)
