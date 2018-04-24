import * as React from 'react'
import { connect } from 'react-redux'
import { NavigationScreenProp, NavigationState } from 'react-navigation'
import { Container, Content, Text, View, Button, Icon, Body } from 'native-base'
import { ReduxProps } from '../../actions/types'
import ROUTES from '../../navigation/routes'
import I18n from '../../i18n'
import AppHeader from '../../components/ui/AppHeader'
type ReduxMappedProps = {}
type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>
}
type Props = ReduxMappedProps & ReduxProps & OwnProps
/**
 * A screen where the user can choose to login with SPID or get more informations.
 */
class LandingScreen extends React.Component<Props, never> {
  render() {
    return (
      <Container>
        <AppHeader>
          <Body>
            <Text>{I18n.t('authentication.landing.headerTitle')}</Text>
          </Body>
        </AppHeader>
        <Content />
        <View footer>
          <Button
            block
            primary
            iconLeft
            onPress={(): boolean =>
              this.props.navigation.navigate(
                ROUTES.AUTHENTICATION_IDP_SELECTION
              )
            }
          >
            <Icon name="user" />
            <Text>{I18n.t('authentication.landing.login')}</Text>
          </Button>
          <View spacer />
          <Button
            block
            small
            transparent
            onPress={(): boolean =>
              this.props.navigation.navigate(
                ROUTES.AUTHENTICATION_SPID_INFORMATION_REQUEST
              )
            }
          >
            <Text>{I18n.t('authentication.landing.nospid')}</Text>
          </Button>
        </View>
      </Container>
    )
  }
}
export default connect()(LandingScreen)
