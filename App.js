import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, PermissionsAndroid } from 'react-native';
import { useFonts } from 'expo-font';
import { Typography, Boxes, Colors, Buttons} from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as wifiP2P from  'react-native-wifi-p2p';

// Components
// TODO: Seperate to files.

function Button({primary = true, children = null, onPress = null}) {
  return (
    <Pressable
      onPressOut={onPress}
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

function DiscoveryStatus({isDiscovering}) {

  if (isDiscovering) {
    discoveryMessage = <Text style={styles.body}>Discovering...</Text>;
  }
  else {
    discoveryMessage = <Text style={styles.body}>Tap discover to begin.</Text>;
  }

  return (
    <View style={styles.discoveryStatus}>
      <Text style={styles.body}>You are not connected.</Text>
      {discoveryMessage}
    </View>
  );
}

function DiscoveryDeviceList() {
  return (
    <View style={styles.discoveryDevices}>
    </View>
  );
}

function DiscoveryButtonPanel({ setDiscovery, isDiscovering }) {
    
  function startDiscovery() {
    wifiP2P.startDiscoveringPeers().then(() => console.log("Started discovery."))
                                  .catch(err => console.log(`Discovery failed. ${err}`));
  }

  function stopDiscovery() {
    wifiP2P.stopDiscoveringPeers().then(() => console.log("Stopped discovery."))
                                  .catch(err => console.log(err));
  }

  return (
    <View style={styles.discoveryButtonPanel}>
      <Button primary={isDiscovering ? false : true} 
              onPress={() => {
                if (isDiscovering) stopDiscovery();
                else startDiscovery();
                  setDiscovery((isDiscovering ? false : true));
                }}>
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
  );
}

function DiscoveryPanel() {
  const [discovering, setDiscovering] = useState(false);

  return (
    <View style={styles.discoveryPanel}>
      <DiscoveryStatus isDiscovering={discovering}></DiscoveryStatus>
      <DiscoveryDeviceList></DiscoveryDeviceList>
      <DiscoveryButtonPanel setDiscovery={setDiscovering} isDiscovering={discovering}></DiscoveryButtonPanel>
    </View>
  );
}

async function requestP2PPermissions() {
  try {
    const granted = await PermissionsAndroid.requestMultiple(
      [
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES,
      ]
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("Required permissions granted.");
    }
    else {
      console.log("Permissions denied.");
    }
  }
  catch (err) {
    console.warn(err);
  }
}


// App
export default function App() {
  // Load Calibri font for the app.
  const [fontsLoaded, fontError] = useFonts({
    "Calibri": require("./assets/fonts/Calibri.ttf"),
  });
  

  useEffect(() => {
    requestP2PPermissions();
    wifiP2P.initialize()
            .then((success) => console.log("Initialization successful."))
            .catch((err) => console.log('initialization failed. Err: ', err));
  }, [])


  // Main application layout
  return (
    <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Wi-Fi P2P Prototype</Text>
        <DiscoveryPanel></DiscoveryPanel>
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
    paddingTop: 20,
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
    flex: 0.25,
    marginVertical: 10,
  },

  discoveryDevices: {
    flex: 4.75,
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
