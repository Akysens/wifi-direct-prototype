import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFonts } from 'expo-font';
import { Typography, Boxes, Colors, Buttons} from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';


function Button({primary, style}) {
  return (
    <Pressable 
      style={({pressed}) => {
        if (pressed) {
          return {...Buttons.buttonPressed, ...style};
        }
        else {
          if (primary) {
            return {...Buttons.buttonPrimary, ...style};
          }

          else {
            return {...Buttons.buttonSecondary, ...style};
          }
        }
      }}>
    </Pressable>
  );
};



export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    "Calibri": require("./assets/fonts/Calibri.ttf"),
  });

  return (
    <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Wi-Fi P2P Prototype</Text>
        <View style={styles.discoveryPanel}>
          <View style={styles.discoveryStatus}>
            <Text style={styles.body}>You are not connected.</Text>
            <Text style={styles.body}>Click discover to begin.</Text>
          </View>
          <View style={styles.discoveryDevices}>

          </View>
          <View style={styles.discoveryButtonPanel}>

          </View>
        </View>
        <View style={styles.chatPanel}>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
  },

  discoveryPanel: {
    flex: 3.1,
    width: "100%",
    marginVertical: 10,
  },

  discoveryStatus: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "center",
    flex: 0.5,
    marginTop: 10,
  },

  discoveryDevices: {
    flex: 4.5,
    width: "100%",
    ...Boxes.roundedBorder,
  },

  discoveryButtonPanel: {
    flex: 1,
  },

  chatPanel: {
    flex: 2.9,
  },

  header: {
    ...Typography.header,
    color: Colors.text,
  },

  body: {
    ...Typography.body,
    color: Colors.text,
  },

  small: {
    ...Typography.small,
    color: Colors.text,
  },


});
