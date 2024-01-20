import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFonts } from 'expo-font';
import { Typography, Boxes, Colors, Buttons} from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';


function Button({primary = true, children = null}) {
  return (
    <Pressable
      style={({pressed}) => {
        if (pressed) {
          return {...Buttons.buttonPressed};
        }
        else {
          if (primary) {
            return {...Buttons.buttonPrimary};
          }

          else {
            return {...Buttons.buttonSecondary};
          }
        }
      }}>
        {children}
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
            <Text style={styles.body}>Tap discover to begin.</Text>
          </View>
          <View style={styles.discoveryDevices}>

          </View>
          <View style={styles.discoveryButtonPanel}>
            <Button primary={true}>
              <Text style={{...Typography.body, color: Colors.white}}>
                Discover
              </Text>
            </Button>

            <Button primary={true}>
              <Text style={{...Typography.body, color: Colors.white}}>
                Connect
              </Text>
            </Button>
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
    flex: 4,
    width: "100%",
    marginVertical: 10,
  },

  discoveryStatus: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "center",
    flex: 0.5,
    marginVertical: 10,
  },

  discoveryDevices: {
    flex: 4.5,
    width: "100%",
    ...Boxes.roundedBorder,
  },

  discoveryButtonPanel: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "center",
    marginVertical: 20,
  },

  chatPanel: {
    flex: 2,
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
