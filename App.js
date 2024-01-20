import { StyleSheet, Text, View } from 'react-native';
import { useFonts } from 'expo-font';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    "InterBlack": require("./assets/fonts/InterBlack.ttf"),
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Wi-Fi P2P Prototype</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontFamily: "InterBlack",
    fontSize: 30,
  }
});
