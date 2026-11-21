# 📱 PitchTank Android App & Google Play Store Guide

This guide explains how to install the APK on an Android device, upload the app to the Google Play Store, and update the app in the future.

---

## 📦 What is in the `Downloadable/` Folder?

1. **`PitchTank-v1.0.apk`**
   - The direct installable Android package for phones and tablets.
   - Sideload it directly onto your Android device to test.
2. **`PitchTank-Android-Project.zip`**
   - The complete native Android project (with Gradle build scripts, AndroidManifest.xml, icons, and Capacitor bridge).
   - Ready to be imported directly into Android Studio for generating the Google Play Store `.aab` (Android App Bundle).

---

## 📲 How to Install the APK on Your Android Phone

1. Transfer **`Downloadable/PitchTank-v1.0.apk`** to your Android phone (via WhatsApp, Google Drive, USB cable, or by downloading it from the browser).
2. Tap the `.apk` file on your phone.
3. If prompted with *"For your security, your phone is not allowed to install unknown apps from this source"*, tap **Settings** and toggle **Allow from this source**.
4. Tap **Install** and then **Open**.
5. PitchTank will run in full screen with your custom app icon!

---

## 🚀 How to Upload to the Google Play Store (Step-by-Step)

Google Play Store requires an **Android App Bundle (`.aab`)** for all new apps:

### Step 1: Open the Project in Android Studio
1. If you don't have Android Studio, download it from [developer.android.com/studio](https://developer.android.com/studio).
2. Open Android Studio and select **Open**, then select the `android/` folder in `d:\PitchTank\android` (or extract `PitchTank-Android-Project.zip`).
3. Android Studio will automatically index the Gradle files.

### Step 2: Generate Signed AAB (Android App Bundle)
1. In Android Studio's top menu, click:  
   **Build > Generate Signed Bundle / APK...**
2. Choose **Android App Bundle** and click **Next**.
3. Under **Key store path**, click **Create new...** to create your release keystore (save this `.jks` file safely — you will need it for future updates!).
4. Fill in:
   - Keystore password
   - Key alias (e.g., `pitchtank-key`)
   - Certificate details (your name / company)
5. Select **release** build variant and click **Finish**.
6. Android Studio will generate your `app-release.aab` file located in:
   `android/app/release/app-release.aab`

### Step 3: Publish to Google Play Console
1. Go to [play.google.com/console](https://play.google.com/console) and sign in.
2. Click **Create App**:
   - App name: **PitchTank**
   - Default language: **English**
   - App or game: **App**
   - Free or paid: **Free**
3. Complete the Store Presence:
   - **App icon**: Upload `LOGO_PitchTank.png` (512x512).
   - **Feature graphic**: 1024x500 banner.
   - **Screenshots**: Take 2-4 screenshots of the Pitch Night stage and shark reactions.
4. Go to **Production > Releases > Create new release**.
5. Drag and drop your **`app-release.aab`**.
6. Enter release notes (e.g., *"Initial release of PitchTank: Tactile Shark Pitch Simulator"*).
7. Review and click **Start rollout to Production**!

---

## 🔄 How to Update the App in the Future

There are **two ways** to update your PitchTank app:

### Method 1: The Modern Live Web Approach (Zero Play Store Re-submissions!)
If you host your PitchTank web app on Vercel, Netlify, or any server:
1. In `capacitor.config.json`, add your live URL:
   ```json
   {
     "appId": "com.pitchtank.app",
     "appName": "PitchTank",
     "webDir": "public",
     "server": {
       "url": "https://your-pitchtank-domain.com",
       "cleartext": true
     }
   }
   ```
2. Run:
   ```powershell
   npx cap sync android
   ```
3. **The Magic**: Every time you update your code and push to Vercel/production, **your Android app updates instantly for all users** without having to build a new APK or wait for Google Play Store review!

---

### Method 2: Offline / Native Version Update (New Play Store Release)
When you make code changes locally and want to release a new version on Play Store:

1. **Make your code edits** in the project.
2. **Build and sync the web assets to Android**:
   ```powershell
   npm run build:apk
   ```
3. **Increment the Version Code**:
   In `android/app/build.gradle`:
   ```groovy
   defaultConfig {
       versionCode 2       // increment: 1 -> 2
       versionName "1.1"   // version string
   }
   ```
4. **Build the updated bundle**:
   - In Android Studio: **Build > Generate Signed Bundle / APK > Android App Bundle**
   - Or run in terminal:
     ```powershell
     cd android
     .\gradlew.bat bundleRelease
     ```
5. **Upload the new `.aab`** to Google Play Console under **Production > Create new release**. Google Play will update the app on all user devices!
