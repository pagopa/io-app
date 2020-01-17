package it.teamdigitale.app.italiaapp;


import androidx.multidex.MultiDexApplication;

import com.facebook.react.ReactApplication;
import com.kristiansorens.flagsecure.FlagSecurePackage;
import com.levelasquez.androidopensettings.AndroidOpenSettingsPackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.rnfingerprint.FingerprintAuthPackage;
import com.RNTextInputMask.RNTextInputMaskPackage;
import com.masteratul.exceptionhandler.ReactNativeExceptionHandlerPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;
import com.reactnativecommunity.netinfo.NetInfoPackage;

public class MainApplication extends MultiDexApplication implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
        new AsyncStoragePackage(),
        new QRScanReaderPackage(),
        new ImagePickerPackage(),
        new FlagSecurePackage(),
        new RNFSPackage(),
        new AndroidOpenSettingsPackage(),
        new RNGestureHandlerPackage(),
        new CalendarEventsPackage(),
        new RNCWebViewPackage(),
        new FingerprintAuthPackage(),
        new BackgroundTimerPackage(),
        new RNInstabugReactnativePackage.Builder(BuildConfig.INSTABUG_TOKEN, MainApplication.this)
          .setInvocationEvent("none")
          .setPrimaryColor("#0073E6")
          .build(),
        new SvgPackage(),
        new RNTextInputMaskPackage(),
        new SplashScreenReactPackage(),
        new ReactNativeExceptionHandlerPackage(),
        new RNCameraPackage(),
        new ReactNativePushNotificationPackage(),
        new KeychainPackage(),
        new RNI18nPackage(),
        new Sha256Package(),
        new RNMixpanel(),
        new RNDeviceInfo(),
        new ReactNativeConfigPackage(),
        new NetInfoPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
