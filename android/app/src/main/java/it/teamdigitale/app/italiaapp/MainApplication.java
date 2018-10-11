package it.teamdigitale.app.italiaapp;

import android.support.multidex.MultiDexApplication;

import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.sha256lib.Sha256Package;
import com.kevinejohn.RNMixpanel.RNMixpanel;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;
import com.facebook.react.ReactApplication;
import com.ocetnik.timer.BackgroundTimerPackage;
import com.instabug.reactlibrary.RNInstabugReactnativePackage;
import com.vonovak.AddCalendarEventPackage;
import com.horcrux.svg.SvgPackage;
import com.RNTextInputMask.RNTextInputMaskPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.masteratul.exceptionhandler.ReactNativeExceptionHandlerPackage;
import org.reactnative.camera.RNCameraPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import com.oblador.keychain.KeychainPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

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
            new BackgroundTimerPackage(),
        new RNInstabugReactnativePackage.Builder(BuildConfig.INSTABUG_TOKEN, MainApplication.this)
          .setInvocationEvent("none")
          .setPrimaryColor("#0073E6")
          .build(),
        new AddCalendarEventPackage(),
        new SvgPackage(),
        new RNTextInputMaskPackage(),
        new SplashScreenReactPackage(),
        new ReactNativeExceptionHandlerPackage(),
        new RNCameraPackage(),
        new VectorIconsPackage(),
        new ReactNativePushNotificationPackage(),
        new KeychainPackage(),
        new RNI18nPackage(),
        new Sha256Package(),
        new RNMixpanel(),
        new RNDeviceInfo(),
        new ReactNativeConfigPackage()
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
