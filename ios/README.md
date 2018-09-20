# iOS How-To

## Configure push notifications

### Generate certificates for APM

We use [fastlane pem](https://docs.fastlane.tools/actions/pem/) to generate the
certificates:

For development:

```
$ fastlane pem --development -p "PASSWORD"
```

For production:

```
$ fastlane pem -p "PASSWORD"
```

Where `PASSWORD` is the password for the certificate.

### Configure Notification Hub

Got to the Azure Notification Hub config dashboard and upload the new
certificate.
