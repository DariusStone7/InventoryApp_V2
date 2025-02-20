import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#025c57",
        },
        headerTintColor: "#ffffff",
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: true, title: "KONTROL" }} />
      <Stack.Screen
        name="details"
        options={{ headerShown: true, title: "Détails" }}
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
