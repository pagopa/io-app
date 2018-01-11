[![Codacy Badge](https://api.codacy.com/project/badge/Grade/4bfe698a793a4270b9bac004515225a3)](https://www.codacy.com/app/cloudify/italia-app?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=teamdigitale/italia-app&amp;utm_campaign=Badge_Grade)

[![dependencies](https://david-dm.org/teamdigitale/italia-app/status.svg)](https://david-dm.org/teamdigitale/italia-app)

[![CircleCI](https://circleci.com/gh/teamdigitale/italia-app.svg?style=svg)](https://circleci.com/gh/teamdigitale/italia-app)

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

#### Nodenv

Su macOS e Linux si consiglia l'uso di [nodenv](https://github.com/nodenv/nodenv) per la gestione di versione multiple di NodeJS.

La versione di node usata nel progetto [è questa](https://github.com/teamdigitale/ItaliaApp/blob/master/.node-version).

#### Yarn

Per la gestione delle dipendenze usiamo [Yarn](https://yarnpkg.com/lang/en/).

#### rbenv

Alcune dipendenze (es. CocoaPods) sono installate tramite [rbenv](https://github.com/rbenv/rbenv).

#### React Native

Seguire [il tutorial (Building Projects with Native Code)](https://facebook.github.io/react-native/docs/getting-started.html) per il proprio sistema operativo.

Se si dispone di un sistema macOS è possibile seguire sia il tutorial per iOS che per Android. Se invece si dispone di un sistema Linux o Windows sarà possibile installare solo l'ambiente di sviluppo per Android.

### Compilazione (dev)

Per prima cosa installiamo le librerie usate dal progetto:

```
$ cd ItaliaApp

$ nodenv install
$ rbenv install

$ gem install bundler
$ bundle install

$ yarn

$ cd ios
$ pod install
```

E poi compiliamo e lanciamo l'app su Android:

```
$ react-native run-android
```

Oppure su iOS:

```
$ react-native run-ios
```

Nota: L'app utilizza [CocoaPods](https://cocoapods.org/), il progetto da eseguire è quindi `ItaliaApp.xcworkspace` anzichè `ItaliaApp.xcodeproj` (`run-ios` lo rileva automaticamente)

### Configurazione
```
$ cp .env.example .env
```
Inseriamo il MixPanel token

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

### Aggiornare icone dell'applicazione

Vedere [questo tutorial](https://blog.bam.tech/developper-news/change-your-react-native-app-icons-in-a-single-command-line).


### Internazionalizzazione

L'applicazione utilizza [react-native-i18n](https://github.com/AlexanderZaytsev/react-native-i18n) per il supporto multilingua.

Per aggiungere una nuova lingua è necessario:

1. Creare un nuovo file all'interno della directory `locales` usando come nome `<langcode>.json` (Es: `es.json`)
2. Copiare il contenuto di uno degli altri file `.json` già presenti
3. Procedere con la traduzione
4. Modificare il file `js/i18n.js` aggiungendo tra gli import e nella variabile `I18n.translations` la nuova lingua 


### Gestione degli errori

L'applicazione utilizza un custom handler per intercettare e notificare errori javascript causati da eccezioni non gestite. Il codice del custom handler e visibile nel file `js/utils/configureErrorHandler.js`
