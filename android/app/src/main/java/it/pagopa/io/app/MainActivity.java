package it.pagopa.io.app;

import android.content.pm.ActivityInfo;
import android.os.Build;
import android.os.Bundle;

import androidx.appcompat.app.AlertDialog;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;
import com.calendarevents.CalendarEventsPackage;
import org.devio.rn.splashscreen.SplashScreen;
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;

public class MainActivity extends ReactActivity {

    private Boolean isRootedDeviceFlag = null;

    /**
     * Returns the name of the main component registered from JavaScript. This is
     * used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "ItaliaApp";
    }

    // see
    // https://github.com/crazycodeboy/react-native-splash-screen#third-stepplugin-configuration
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        /*
         * When the app starts, a check is made on the "isTablet" flag in the bools.xml
         * file. The value changes automatically depending on the device dp. Starting
         * from 600dp it is set to true.
         */
        if (getResources().getBoolean(R.bool.isTablet)) {
            super.onCreate(savedInstanceState);
            showAlertDialog(getString(R.string.dialog_attention), getString(R.string.tablet_not_supported));
        } else {
            SplashScreen.show(this, R.style.SplashScreenTheme);
            super.onCreate(savedInstanceState);
        }
        // Fix the problem described here:
        // https://stackoverflow.com/questions/48072438/java-lang-illegalstateexception-only-fullscreen-opaque-activities-can-request-o
        if (android.os.Build.VERSION.SDK_INT != Build.VERSION_CODES.O) {
            setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        }
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new ReactActivityDelegate(this, getMainComponentName()) {
            @Override
            protected ReactRootView createRootView() {
                return new RNGestureHandlerEnabledRootView(MainActivity.this);
            }
        };
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        CalendarEventsPackage.onRequestPermissionsResult(requestCode, permissions, grantResults);
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }


    private void showAlertDialog(String title, String message) {
        new AlertDialog.Builder(MainActivity.this).setTitle(title).setMessage(message)
                .setPositiveButton(getString(android.R.string.ok), (dialog, which) -> finish()).setCancelable(false)
                .show();
    }
}
