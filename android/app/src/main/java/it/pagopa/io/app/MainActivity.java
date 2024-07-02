package it.pagopa.io.app;

import android.content.pm.ActivityInfo;
import android.os.Build;
import android.os.Bundle;

import androidx.appcompat.app.AlertDialog;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import org.devio.rn.splashscreen.SplashScreen;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript. This is
     * used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "IO";
    }

    // see
    // https://github.com/crazycodeboy/react-native-splash-screen#third-stepplugin-configuration
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.show(this, R.style.SplashScreenTheme);
        super.onCreate(savedInstanceState);
        // Fix the problem described here:
        // https://stackoverflow.com/questions/48072438/java-lang-illegalstateexception-only-fullscreen-opaque-activities-can-request-o
        if (android.os.Build.VERSION.SDK_INT != Build.VERSION_CODES.O) {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        }
    }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
   * (aka React 18) with two boolean flags.
   */
    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
      return new DefaultReactActivityDelegate(
          this,
          getMainComponentName(),
          // If you opted-in for the New Architecture, we enable the Fabric Renderer.
          DefaultNewArchitectureEntryPoint.getFabricEnabled());
    }
}
