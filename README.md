# 🩸 Blood Donor Finder – Mobile App (Expo + React Native + TypeScript)

A production-ready React Native application that connects blood donors with people in need. The app features real-time push notifications, location-based donor matching, and a seamless user experience built with TypeScript and modern React Native tools.

## 📱 Download & Try

- **Download APK:** [Latest Release](https://github.com/ChamodyaIshani99/blood-donor-app/releases/tag/v1.0.0)
- **Backend API Repo:** [blood-donor-api](https://github.com/ChamodyaIshani99/blood-donor-api)

> ⚠️ **Note on Push Notifications:** Remote push notifications **do not work in Expo Go on Android** (SDK 53+). To test push notifications, you must build a **Development Build** or install the production APK on a physical Android device. Everything else works perfectly in Expo Go.

---

## ✨ Key Features

- 🔐 **Secure Authentication:** JWT-based login/register with token storage in `SecureStore`.
- 🔔 **Real-time Push Notifications:** Instant alerts for matching blood requests based on blood group and district.
- 🩸 **Smart Donor Search:** Filter donors by blood group, district, and area.
- 📋 **Blood Request Management:** Create, view, edit, and fulfill blood requests.
- 📞 **Direct Calling:** Call donors directly from the app.
- 🟢 **Availability Toggle:** Donors can easily toggle their visibility.
- 📅 **Donation Cooldown:** Automatically hides donors who have donated within the last 90 days.

---

## 🛠 Tech Stack

- **Framework:** [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/)
- **Language:** TypeScript
- **Navigation:** React Navigation (AuthStack & MainTabs)
- **State Management & Data Fetching:** [React Query (TanStack)](https://tanstack.com/query)
- **Forms & Validation:** React Hook Form + [Zod](https://zod.dev/)
- **Push Notifications:** Expo Notifications + Firebase Cloud Messaging (FCM V1)
- **HTTP Client:** Axios
- **Storage:** Expo SecureStore

---

## 📂 Project Structure

```text
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
  notifications/             push.ts (setup), useNotifications.ts (handlers)
