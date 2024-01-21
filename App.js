import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, PermissionsAndroid, ScrollView, FlatList } from 'react-native';
import { useFonts } from 'expo-font';
import { Typography, Boxes, Colors, Buttons} from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as wifiP2P from  'react-native-wifi-p2p';

// Components
// TODO: Seperate to files.

/**
 * Button with Pressable of React-Native.
 * 
 * @param {{primary: boolean, children: any, onPress: function}} properties of Button  
 * @returns A button JSX component, where the onPress function is called when user presses out of the button.
 * Button's look is changed depending on its a "primary" button or not.
 * Style also changes when its pressed. 
 */

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

/**
 * Discovery status messages for discovery panel.
 * 
 * @param {isDiscovering} isDiscovering property for DiscoveryStatus 
 * @returns Displays corresponding status message depending on whether device is discovering or connected. 
 */
function DiscoveryStatus({isDiscovering, selection, isConnected}) {

  if (isDiscovering) {
    discoveryMessage = <Text style={styles.small}>Discovering...</Text>;
  }
  else {
    discoveryMessage = <Text style={styles.small}>Tap discover to begin.</Text>;
  }


  if ((selection !== null)) {
    connectionMessage = <Text style={styles.small}>Selected: {selection}</Text>;
  }
  else if (isConnected === null) {
    connectionMessage = <Text style={styles.small}>You are not connected.</Text>;
  }
  else {
    connectionMessage = <Text style={styles.small}>Connected: {selection}</Text>;
  }

  return (
    <View style={styles.discoveryStatus}>
      {connectionMessage}
      {discoveryMessage}
    </View>
  );
}

/**
 * Discovery device list.
 */
function DiscoveryDeviceList({devices, handleSelect, selection}) {

  function DiscoveryListItem({address, status}) {
    return (
      <View style={styles.discoveryDevice}>
        <Text style={styles.small}>{address}</Text>
        <Text style={styles.small}>{status}</Text>
      </View>
    )
  };

  const renderItem = ({item}) => {
    return (
      <Pressable
        onPress={() => {
          handleSelect(item.deviceAddress);
        }}>
          <DiscoveryListItem address={item.deviceAddress} status={item.deviceName}/>
      </Pressable>
    );
  }

  return (
    <View style={styles.discoveryDevices}>
      <FlatList
        data={devices}
        renderItem={renderItem}>
      </FlatList>
    </View>
  );
}

/**
 * Button panel for discovery.
 * 
 * @param {*} props for DiscoveryButtonPanel 
 * @returns A view with two buttons, one with the ability of starting and stopping a discovery, 
 * the other with connecting and stopping a connection. 
 */
function DiscoveryButtonPanel({setDevices, setDiscovery, isDiscovering, setConnected, isConnected, selection}) {
  const [subscription, setSubscription] = useState(null);

  function startDiscovery() {
    wifiP2P.startDiscoveringPeers().then(() => console.log("Started discovery."))
                                  .catch(err => console.log(`Discovery failed. Maybe GPS is off? ${err.message}`));

    if (subscription === null) {
    setSubscription(wifiP2P.subscribeOnPeersUpdates(({devices}) => {
      console.log(`Available devices: ${devices.map((item) => item.deviceAddress)}`);
      setDevices(devices);
    }))};
  }

  function stopDiscovery() {
    wifiP2P.stopDiscoveringPeers().then(() => console.log("Stopped discovery."))
                                  .catch(err => console.log(err));
    subscription.remove();
    setSubscription(null);
  }

  function connectToDevice(deviceAddress) {
    console.log(`Selected device: ${deviceAddress}`);
    wifiP2P.connect(deviceAddress).then(() => console.log(`Connected to address ${deviceAddress} successfully.`))
                          .catch((err) => console.log(`Connection failed with: ${err.message}`));

    setConnected(deviceAddress);
  }

  function unconnect() {
    wifiP2P.cancelConnect().then(() => console.log("Disconnected."))
                   .catch((err) => console.log(`Connection obliteration failed with: ${err.message}`));

    setConnected(null);
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

      <Button primary={isConnected ? false : true}
              onPress={() => {
                if (isConnected) unconnect();
                else connectToDevice(selection);
                  setConnected((isConnected ? false : true));
                }}>
        <Text style={{...Typography.body, color: Colors.white}}>
          Connect
        </Text>
      </Button>
    </View>
  );
}

/**
 * Discovery Panel
 * 
 * @returns A view with DiscoveryStatus, DiscoveryDeviceList, and DiscoveryButtonPanel.
 */
function DiscoveryPanel() {
  const [discovering, setDiscovering] = useState(false);
  const [connected, setConnected] = useState(null);
  const [deviceList, setDeviceList] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  return (
    <View style={styles.discoveryPanel}>
      <DiscoveryStatus isDiscovering={discovering} isConnected={connected} selection={selectedDevice}/>
      <DiscoveryDeviceList devices={deviceList} handleSelect={setSelectedDevice} selection={selectedDevice}/>
      <DiscoveryButtonPanel setDiscovery={setDiscovering} setDevices={setDeviceList} isConnected={connected} setConnected={setConnected} isDiscovering={discovering} selection={selectedDevice}/>
    </View>
  );
}


/**
 * An async function that requests ACCESS_FINE_LOCATION permission
 * from the device it runs on.
 */
async function requestP2PPermissions() {
  try {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);

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


/**
 * Main application
 * Requests required permissions and initializes wifiP2P manager.
 * 
 * @returns A SafeAreaView that contains Discovery and Chat panel.
 */
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
    flex: 0.4,
    marginVertical: 10,
  },

  discoveryDevices: {
    flex: 4.6,
    width: "100%",
    ...Boxes.roundedBorder,
    padding: 5,
  },

  discoveryDevice: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    width: "100%",
    backgroundColor: Colors.box,
    elevation: 5,
    marginBottom: 10,
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
