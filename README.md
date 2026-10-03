# Blood Donor Finder – Mobile App (Expo + React Native + TypeScript)

## Run
1. `npm install`
2. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL` (your backend, ending with `/api`)
   - Real phone: use your PC's local IP, e.g. `http://192.168.1.10:5000/api` (phone and PC on the same Wi-Fi)
   - Android emulator: `http://10.0.2.2:5000/api`
3. Start the backend (`npm run dev` in `blood-donor-api`)
4. `npx expo start` and scan the QR code with Expo Go
5. If Expo warns about package versions: `npx expo install --fix`

After changing `.env`, restart with `npx expo start -c`.

## Structure
```
App.tsx                      providers (SafeArea, React Query, Auth) + navigator
src/
  api/client.ts              axios instance, token header, auto-logout on 401
  config/constants.ts        blood groups, districts, storage key
  context/AuthContext.tsx    login / register / logout, token in SecureStore
  navigation/                AuthStack (Login, Register) and MainTabs (Home, Donors, Requests, Profile)
  components/                Button, FormInput, FormSelect, ErrorBanner, Screen
  screens/auth/              LoginScreen, RegisterScreen
  screens/main/              Home (quick search + requests you can help with), Donors (search), Profile + EditProfile
  screens/requests/          RequestsList (feed + mine), RequestDetails, RequestForm (create/edit)
  hooks/                     useDonors (infinite query), useDebounce
  utils/validation.ts        zod schemas (same rules as the API)
  utils/errors.ts            turns API/network errors into readable messages
```

## Push notifications (needs a development build)
Remote push does **not** work in Expo Go on Android (SDK 53+). Everything else works in Expo Go.
To test push you need a development build on a real phone:

```bash
npm install -g eas-cli
eas login
eas init                                   # writes extra.eas.projectId into app.json
eas build --profile development --platform android
```
Android also needs Firebase (FCM) credentials: follow
https://docs.expo.dev/push-notifications/push-notifications-setup/ (add `google-services.json`, upload the FCM key to EAS).
Install the built app on your phone, then run `npx expo start --dev-client`.

Package name is `com.ishani.blooddonorfinder` (app.json). Change it before your first build if you want another one.

Flow: login -> permission prompt -> Expo push token -> `POST /api/users/me/push-token`.
Tapping a notification opens that request (`data.requestId`). Logout removes the token from the server.
