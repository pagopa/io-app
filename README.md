[![Codacy Badge](https://api.codacy.com/project/badge/Grade/4bfe698a793a4270b9bac004515225a3)](https://www.codacy.com/app/cloudify/italia-app?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=teamdigitale/italia-app&amp;utm_campaign=Badge_Grade)

[![dependencies](https://david-dm.org/teamdigitale/italia-app/status.svg)](https://david-dm.org/teamdigitale/italia-app)

[![CircleCI](https://circleci.com/gh/teamdigitale/italia-app.svg?style=svg)](https://circleci.com/gh/teamdigitale/italia-app)

[![codecov](https://codecov.io/gh/teamdigitale/italia-app/branch/master/graph/badge.svg)](https://codecov.io/gh/teamdigitale/italia-app)

[![Maintainability](https://api.codeclimate.com/v1/badges/d813b789c3a2085bd8f4/maintainability)](https://codeclimate.com/github/teamdigitale/italia-app/maintainability)

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fteamdigitale%2Fitalia-app.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fteamdigitale%2Fitalia-app?ref=badge_shield)

# L'app mobile della Cittadinanza Digitale

## FAQ

### Cos'è la Cittadinanza Digitale?

La Cittadinanza Digitale ha l'obiettivo di portare il cittadino al centro dei servizi erogati dalle pubbliche amministrazioni italiane.

Il progetto si estende su due linee:

* la costruzione di una piattaforma di componenti che abilitano lo sviluppo di servizi digitali incentrati sul cittadino
* un'interfaccia del cittadino per gestire i propri dati e il proprio profilo di cittadino digitale

### Cos'è l'app mobile della Cittadinanza Digitale?

L'app mobile della Cittadinanza Digitale è un'applicazione mobile nativa per iOS e Android con duplice scopo:

* essere un interfaccia per il cittadino verso i propri dati e il proprio profilo di cittadino digitale
* fungere da _reference implementation_ delle integrazioni con la piattaforma di Cittadinanza Digitale

### Chi sviluppa l'app?

Lo sviluppo dell'app è portato avanti da diversi _contributors_: [L'Agenzia per l'Italia Digitale](http://www.agid.gov.it/), [il Team per la Trasformazione Digitale](https://teamdigitale.governo.it/) e volontari indipendenti che credono nel progetto.

### Posso usare l'app?

Per ora l'app non è ancora stata pubblicata sugli app store per cui non è possibile installarla tramite i meccanismi abituali.

Se sei uno sviluppatore puoi invece compilare l'app sul tuo computer e installarla manualmente sul tuo device.

### Quando sarà pubblicata l'app?

Quando l'app avrà raggiunto un livello di qualità e di utilità che ci soddisfa, la renderemo disponibile a tutti i cittadini.

### Come posso darvi una mano?

Segnalazione di bug, bugfix ed in genere qualsiasi miglioramento è il benvenuto! Mandaci una Pull Request!

Se invece hai un po' di tempo da dedicarci e vuoi essere coinvolto in modo continuativo, [mandaci una mail](mailto:federico@teamdigitale.governo.it).

## Tecnologie usate

* [React Native](https://facebook.github.io/react-native)
* [Redux](http://redux.js.org/)
* [Native Base](http://nativebase.io)
* [Flow](https://flow.org/)

## Architettura

### Autenticazione SPID

L'applicazione si appoggia ad un [backend web](https://github.com/teamdigitale/ItaliaApp-backend) per l'autenticazione a SPID. Il backend implementa un Service Provider SAML2 ([tramite Shibboleth](https://github.com/italia/spid-sp-playbook/)) che si occupa dell'autenticazione dell'utente sugli Identity Provider SPID.

L'autenticazione tra l'applicazione e il backend avviene tramite un token di sessione, generato dal backend al momento dell'autenticazione sull'IdP SPID.

Una volta che il backend comunica il token di sessione all'applicazione, questo viene usato per tutte le successive chiamate che l'applicazione fa alle API esposte dal backend.

Il flusso di autenticazione è il seguente:

1. L'utente seleziona l'IdP
2. L'app apre una webview sull'endpoint di autenticazione Shibboleth implementato nel backend, specificando l'entity ID dell'IdP selezionato dall'utente e, come URL di ritorno, l'URL dell'endpoint che genera un nuovo token di sessione (es. `/app/token/new`).
3. Shibboleth prende in carico il processo di autenticazione verso l'IdP
4. Ad autenticazione avvenuta, viene fatto un redirect dall'IdP all'endpoint del backend che si occupa della generazione di un nuovo token di sessione.
5. L'endpoint di generazione di un nuovo token riceve via header HTTP gli attributi SPID, poi genera un nuovo token di sessione (es. `123456789`) e restituisce alla webview un HTTP redirect verso un URL _well known_, contenente il token di sessione (es. `/api/token/123456789`)
6. L'app, che controlla la webview, intercetta questo URL prima che venga effettuata la richiesta HTTP, ne estrae il token di sessione e termina il flusso di autenticazione chiudendo la webview.

Successivamente il token di sessione viene usato dall'app per effettuare le chiamate all'API di backend (es. per ottenere gli attributi SPID).

## Come contribuire

### Pre-requisiti

#### nodenv

Su macOS e Linux si consiglia l'uso di [nodenv](https://github.com/nodenv/nodenv)
per la gestione di versione multiple di NodeJS.

La versione di node usata nel progetto [è questa](.node-version).

Se si ha già `nodenv` installato e configurato sul proprio sistema, la versione
di `node` corretta verrà impostata quando si accede alla directory dell'app.

#### yarn

Per la gestione delle dipendenze javascript usiamo
[Yarn](https://yarnpkg.com/lang/en/).

#### rbenv

Su macOS e Linux si consiglia l'uso di [rbenv](https://github.com/rbenv/rbenv)
per la gestione di versione multiple di Ruby.

La versione di Ruby usata nel progetto [è questa](.ruby-version).

Se si ha già `rbenv` installato e configurato sul proprio sistema, la versione
di Ruby corretta verrà impostata quando si accede alla directory dell'app.

#### Bundler

Alcune dipendenze (es. CocoaPods) sono installate tramite [bundler](https://bundler.io/).

#### React Native

Seguire [il tutorial (Building Projects with Native Code)](https://facebook.github.io/react-native/docs/getting-started.html) per il proprio sistema operativo.

Se si dispone di un sistema macOS è possibile seguire sia il tutorial per iOS che per Android. Se invece si dispone di un sistema Linux o Windows sarà possibile installare solo l'ambiente di sviluppo per Android.

### Compilazione e lancio sul simulatore

#### Dipendenze

Per prima cosa installiamo le librerie usate dal progetto:

```
$ bundle install
$ yarn install
$ cd ios
$ pod install
```

#### Generazione definizioni API

Il secondo passo è generare le definizioni dalle specifiche openapi:

```
$ yarn generate:api-definitions
```

#### Configurazione dell'app

Infine copiamo la configurazione di esempio per l'app.

```
$ cp .env.example .env
```

Nota: la configurazione di esempio imposta l'app per interfacciarsi al nostro
ambiente di test, su cui lavoriamo continuamente - potrebbe quindi accadere
che alcune funzionalità non siano sempre disponibili o completamente
funzionanti.

#### Installazione sul simulatore

Su Android (il simulatore del device va [lanciato a mano](https://medium.com/@deepak.gulati/running-react-native-app-on-the-android-emulator-11bf309443eb)):

```
$ react-native run-android
```

Su iOS (il simulatore verrà lanciato automaticamente):

```
$ react-native run-ios
```

Nota: l'app utilizza [CocoaPods](https://cocoapods.org/), il progetto da eseguire è quindi `ItaliaApp.xcworkspace` anzichè `ItaliaApp.xcodeproj` (`run-ios` lo rileva automaticamente)

### Compilazione (release)

Per il rilascio dell'app sugli store usiamo Fastlane.

#### iOS

La distribuzione della beta viene fatta con il modello ad-hoc.

Per rilasciare una nuova beta:

```
$ bundle exec fastlane beta
```

Per aggiungere un nuovo device alla distribuzione ad-hoc:

```
$ bundle exec fastlane register_new_device
```

#### Android

Per rilasciare una nuova alpha:

```
$ bundle exec fastlane alpha
```

### Installazione su device

#### iOS

```
react-native run-ios --configuration Release --device 'YOUR_DEVICE_NAME'
```

### Sviluppo con App Backend e IDP di test in locale

Per sviluppare l'applicazione utilizzando in locale l'App Backend e un IDP di test, è necessario seguire alcuni step aggiuntivi descritti di seguito.

#### Installazione di App Backend e IDP di test

Seguire la documentazione del repository [italia-backend](https://github.com/teamdigitale/italia-backend).

#### WebView, HTTPS e certificati autofirmati

Allo stato attuale react-native non consente di aprire WebView su url HTTPS con certificato autofirmato. L'IDP di test però fa utilizzo di HTTPS e di un certificato autofirmato. Per ovviare a questo problema è possibile installare in locale un Proxy che faccia da proxy-pass verso l'App Backend e l'IDP.

##### Installazione di mitmproxy

Un proxy semplice da utilizzare e addatto al nostro scopo è [mitmproxy](https://mitmproxy.org/). Per l'installazione seguire la [pagina di documentazione](https://docs.mitmproxy.org/stable/overview-installation/) del sito ufficiale.

All'interno del repository è presente il file `scripts/mitmproxy_metro_bundler.py` che permette al proxy di intercettare le richieste verso il Simulatore e, solo in caso di porte specifiche, effettuare il proxy-pass verso localhost.
Avviare il Proxy con il seguente comando:

```
SIMULATOR_HOST_IP=XXXXX mitmweb --listen-port 9060 --web-port 9061 --ssl-insecure -s scripts/mitmproxy_metro_bundler.py
```

Inserire al posto di `XXXXX`:
* `10.0.2.2` (Standard Android Emulator)
* `10.0.3.2` (Genymotion Android Emulator)

##### Installazione del certificato di mitmproxy all'interno dell'emulatore Android

Installare il certificato di mitmproxy all'interno dell'emulatore seguendo la [giuda](https://docs.mitmproxy.org/stable/concepts-certificates/) ufficiale.

#### Impostare il proxy per la connessione nell'emulatore Android

Nella configurazione della connessione inserire:
* IP Proxy: `10.0.2.2` (o `10.0.3.2` nel caso si utilizzi Genymotion)
* Porta Proxy: `9060`

### Aggiornare icone dell'applicazione

Vedere [questo tutorial](https://blog.bam.tech/developper-news/change-your-react-native-app-icons-in-a-single-command-line).


### Internazionalizzazione

L'applicazione utilizza [react-native-i18n](https://github.com/AlexanderZaytsev/react-native-i18n) per il supporto multilingua.

Per aggiungere una nuova lingua è necessario:

1. Creare un nuovo file all'interno della directory `locales` usando come nome `<langcode>.json` (Es: `es.json`)
2. Copiare il contenuto di uno degli altri file `.json` già presenti
3. Procedere con la traduzione
4. Modificare il file `ts/i18n.ts` aggiungendo tra gli import e nella variabile `I18n.translations` la nuova lingua


### Gestione degli errori

L'applicazione utilizza un custom handler per intercettare e notificare errori javascript causati da eccezioni non gestite. Il codice del custom handler è visibile nel file `ts/utils/configureErrorHandler.ts`


### Monitoring della connessione

L'applicazione utilizza la libreria [react-native-offline](https://github.com/rauliyohmc/react-native-offline) per monitorare lo stato della connessione. In caso di assenza di connessione viene visualizzata una barra che notifica l'utente. Lo stato della connessione è mantenuto all'interno dello store nella variabile `state.network.isConnected`, è possibile utilizzare questo dato per disabilitare alcune funzioni durante l'assenza della connessione.


### Deep linking

L'applicazione è in grado di gestire i _deep link_. Lo schema URL è: `ioit://`. Il formato del link varia in base alla piattaforma:

- Android: `ioit://ioit/<route-name>`
- iOS: `ioit://<route-name>`

`<route-name>` dev'essere un valore contenuto nel file `ts/navigation/routes.ts`.

### Fonts

L'applicazione utilizza il font `Titillium Web`. I fonts vengono gestiti in modo differente da Android e iOS. Per utilizzare il font `TitilliumWeb-SemiBoldItalic` ad esempio è necessario applicare le seguenti proprietà per Android:

```
{
  fontFamily: 'TitilliumWeb-SemiBoldItalic'
}
```

mentre in iOS il codice da applicare è:

```
{
  fontFamily: 'Titillium Web',
  fontWeight: '600',
  fontStyle: 'italic'
}
```

Per rendere la gestione dei font e delle varianti più sempice sono state create delle funzioni di utilità all'interno del file `ts/theme/fonts.ts`

### Io-Icon-Font

L'applicazione utilizza un font-icon custom dal nome 'io-icon-font'. Grazie alla libreria [react-native-vector-icons](https://github.com/oblador/react-native-vector-icons) inclusa nel progetto è possibile creare nuovi IconSet. In particolare tra i vari metodi esposti nell'[apposita sezione](https://github.com/oblador/react-native-vector-icons#custom-fonts) della documentazione si è scelto di utilizzare quello che prevede di esportare il font tramite [IcoMoon](https://icomoon.io/). Durante l'esportazione da IcoMoon utilizzare la configurazione mostrata nella seguente figura.

![IcoMoon Export Settings][icomoon-export-settings]

Per aggiornare l'icon-font ad una nuova versione è necessario estrarre e posizionare correttamente i seguenti due file dall'archivio '.zip' generatoro da IcoMoon:

* `selection.json` contenuto nella root dell'archivio, da posizionare in `ts/theme/font-icons/io-icon-font/`
* `io-icon-font.ttf` contenuto nella directory `fonts` dell'archivio, da posizionare in `assets/fonts/io-icon-font/`

Una volta copiati i due file è necessario aggiornare il link dell'asset eseguendo

```
react-native link
```

Questo ultimo comando si occupa in particolare di copiare l'asset all'interno di una cartella specifica del sottoprogetto Android.


### Theming

L'applicazione utilizza [native-base](https://nativebase.io/) e i suo componenti per la realizzazione dell'interfaccia grafica. In particolare è stato scelto di utilizzare come base il tema `material` previsto dalla libreria. Sebbene native-base permetta attraverso l'uso di variabili di personalizzare parte del tema è stato comunque necessario implementare delle funzioni ad-hoc che consentano di andare a modificare il tema dei singoli componenti.

#### Estensione di native-base

Nella directory `/ts/theme` sono presenti alcuni file che consentono di gestire il tema in modo più flessibile rispetto a quanto permesso nativamente da native-base.

##### Variabili

Per definire nuove variabili da utilizzare nel tema dei componenti è necessario modificare il file `/ts/theme/variables.ts`. Tale file si occupa di importare le variabili di base definite dal tema `material` di native-base e permette di sovrascrivere/definire il valore di nuove variabili.

##### Tema dei Componenti

La libreria native-base definisce il tema di ogni singolo componente in un file .ts separato che ha come nome quello dello specifico componente. Ad esempio il file del tema relativo al componente `Button` ha come nome `Button.ts`.
Per ridefinire il tema dei componenti di native-base è necesario creare/modificare i file presenti nella directory `/ts/theme/components`. Ogni file presente in questa directory deve esportare un oggetto che definisce il tema del componente. Prendiamo come esempio il file `Content.ts`:

```javascript
import { type Theme } from '../types'
import variables from '../variables'

export default (): Theme => {
  const theme = {
    padding: variables.contentPadding,
    backgroundColor: variables.contentBackground
  }

  return theme
}
```

In questo file è possibile notare come vengono ridefiniti due attributi (`padding` e `backgroundColor`) utilizzando come valori quanto presente nelle relative variabili. L'oggetto restituito sarà utilizzato nel file `/ts/theme/index.ts` per associarlo ad uno specifico tipo di componente (in questo caso `NativeBase.Component`).

Un esempio più complesso permette di utilizzare le funzioni avanzate del layer di theming di native-base.

```javascript
import { type Theme } from '../types'
import variables from '../variables'

export default (): Theme => {
  const theme = {
    '.spacer': {
      '.large': {
        height: variables.spacerLargeHeight
      },

      height: variables.spacerHeight
    },

    '.footer': {
      paddingTop: variables.footerPaddingTop,
      paddingLeft: variables.footerPaddingLeft,
      paddingBottom: variables.footerPaddingBottom,
      paddingRight: variables.footerPaddingRight,
      backgroundColor: variables.footerBackground,
      borderTopWidth: variables.footerShadowWidth,
      borderColor: variables.footerShadowColor
    }
  }

  return theme
}
```

All'interno del file del tema di un singolo componente è possibile infatti definire degli attributi specifici che verranno utilizzati solo nel caso in cui il componente in questione abbia una specifica proprietà.
Definendo nell'oggetto di tema qualcosa come:

```javascript
'.footer': {
  paddingTop: variables.footerPaddingTop
}
```

se necessario, sarà possibile utilizzare il componente associandogli la proprietà `footer` nel seguente modo `<Component footer />` ed automaticamente il sistema di theming applicherà al componente gli attributi definiti (`paddingTop: variables.footerPaddingTop`).

Altra funzione avanzata è quella che permette di definire il tema dei componenti figli a partire dal componente padre.
Prediamo come esempio il seguente frammento di codice di un generico componente:

```javascript
...
render() {
  return(
    <Content>
      <Button>
        <Text>My button</Text>
      </Button>
    </Content>
  )
}
...
```

La libreria native-base permette di definire l'aspetto del componente figlio `Text` presente all'interno del componente padre `Button`. Ad esempio per definire la dimensione del testo in tutti i bottoni presenti nell'applicazione, è sufficiente inserire il seguente codice all'interno del file `/ts/theme/components/Button.ts`:

```javascript
import variables from '../variables'

export default (): Theme => {
  const theme = {
    'NativeBase.Text': {
      fontSize: variables.btnTextFontSize
    }
  }

  return theme
}
```

È possibile spingersi ancora oltre e combinare le due funzionalità viste in precedenza:

```javascript
import variables from '../variables'

export default (): Theme => {
  const theme = {
    '.small': {
      'NativeBase.Text': {
        fontSize: variables.btnTextFontSize
      }
    }
  }

  return theme
}
```

In questo caso quanto definito all'interno dell'attributo `NativeBase.Text` sarà utilizzato solo nel caso in cui il bottone abbia associata una proprietà dal nome `small`.

### Custom UI components

#### TextWithIcon

Un semplice wrapper in cui è possibile inserire un'icona ed un testo che verranno renderizzati uno di fianco all'altro.

Esempio di utilizzo:

```javascript
<TextWithIcon danger>
  <IconFont name="io-back" />
  <Text>{I18n.t('onboarding.pin.confirmInvalid')}</Text>
</TextWithIcon>
```

Per cambiare il tema del wrapper, dell'icona o del testo modificare il file `ts/theme/components/TextWithIcon.ts`.

### Test end to end con Detox (sperimentale)

Per i test di integrazione sui simulatori usiamo
[Detox](https://github.com/wix/detox).

I test end to end si trovano in [ts/__e2e__/](ts/__e2e__/).

Per compilare l'app in preparazione al test:

```
$ detox build
```

(opzionale) Lanciare il simulatore iOS (con [ios-sim](https://www.npmjs.com/package/ios-sim) per comodità):

```
$ ios-sim start --devicetypeid "iPhone-6, 10.2"
```

Nel caso non si lanci il simulatore, Detox ne lancerà uno in background.

Lancio dei test:

```
$ detox test
```

## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fteamdigitale%2Fitalia-app.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fteamdigitale%2Fitalia-app?ref=badge_large)

[icomoon-export-settings]: docs/icomoon-font-export.png "IcoMoon Export Settings"
