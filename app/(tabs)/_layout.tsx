import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function TabLayout() {
  return (
    <>
      <StatusBar style="light"/>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#025c57",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Accueil",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "home-sharp" : "home-outline"}
                color={color}
                size={24}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="inventory"
          options={{
            title: "Inventaires",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={
                  focused ? "layers-sharp" : "layers-outline"
                }
                color={color}
                size={24}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
