import type { ExpoConfig } from 'expo/config';

export default ({ config }: { config: ExpoConfig }): ExpoConfig => {
  return {
    ...config,
    jsEngine: "hermes",
    name: "WhatsApp-Clone",
    slug: "whatsapp-clone",
    owner: "iroka09",
    version: "2.2.0",
    icon: "./assets/images/ic_launcher_foreground.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      resizeMode: "contain",
      backgroundColor: "#ffffff",
      image: "./assets/images/ic_launcher_foreground.png"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.iroka09.whatsappClone"
    },
    scheme: "wclone",
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/ic_launcher_foreground.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.iroka09.whatsapp_clone",
      intentFilters: [
        {
          autoVerify: true,
          action: "VIEW",
          data: [
            {
              scheme: "wclone",
              host: "home"
            }
          ],
          category: [
            "BROWSABLE",
            "DEFAULT"
          ]
        }
      ]
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    experiments: {
      typedRoutes: true,
      buildCacheProvider: "eas"
    },
    extra: {
      router: {},
      eas: {
        projectId: "5388ec0d-6c69-4332-8b1d-1c4a4cb74dd3"
      }
    },
    plugins: [
      "expo-router",
      [
        "expo-notifications",
        {
          icon: "./assets/images/ic_launcher_foreground.png",
          color: "#ffffff",
          defaultChannel: "default",
          sounds: [
            "./assets/sounds/mixkit_software_interface_remove.wav"
          ],
          enableBackgroundRemoteNotifications: false
        }
      ],
      [
        "expo-asset",
        {
          assets: [
            "./assets/images/me.jpg",
            "./assets/images/amani.jpg",
            "./assets/images/play.png"
          ]
        }
      ],
      [
        "expo-audio",
        {
          microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone."
        }
      ],
      [
        "expo-av",
        {
          microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone."
        }
      ],
      "expo-web-browser",
      "expo-background-task",
      "expo-maps"
    ]
  }
}
