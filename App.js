import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, PermissionsAndroid, ScrollView, FlatList, TextInput } from 'react-native';
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


  if ((selection !== null && isConnected === null)) {
    connectionMessage = <Text style={styles.small}>Selected: {selection}</Text>;
  }
  else if (isConnected === null) {
    connectionMessage = <Text style={styles.small}>You are not connected.</Text>;
  }
  else if (isConnected !== null) {
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
function DiscoveryButtonPanel({setDevices, setDiscovery, isDiscovering, setConnected, connectedDevice, selection, setConnectionAddresses, connectionAddresses}) {
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

    wifiP2P.getConnectionInfo().then((info) => {
      console.log("Connection information:", info);
    }).catch((err) => console.log("Connection info failed:", err));

    setConnected(deviceAddress);
  }

  function unconnect() {
    wifiP2P.getGroupInfo()
    .then(() => wifiP2P.removeGroup())
    .then(() => console.log('Succesfully disconnected!'))
    .catch(err => console.log('Disconnect failed. Details: ', err));

    setConnected(null);
  }

  return (
    <View style={styles.ButtonPanel}>
      <Button primary={isDiscovering ? false : true} 
              onPress={() => {
                if (isDiscovering) stopDiscovery();
                else startDiscovery();
                  setDiscovery((isDiscovering ? false : true));
                }}>
        <Text style={styles.buttonText}>
          Discover
        </Text>
      </Button>

      <Button primary={(connectedDevice === null)}
              onPress={() => {
                console.log("Last connected:", connectedDevice)
                if (connectedDevice !== null) {
                  unconnect();
                  setConnected(null);
                }
                else {
                  connectToDevice(selection);
                  setConnected(selection);
                }
                }}>
        <Text style={styles.buttonText}>
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
function DiscoveryPanel({connectedDevice, setConnected, setConnectionAddresses, connectionAddresses}) {
  const [discovering, setDiscovering] = useState(false);
  const [deviceList, setDeviceList] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  return (
    <View style={styles.discoveryPanel}>
      <DiscoveryStatus isDiscovering={discovering} isConnected={connectedDevice} selection={selectedDevice}/>
      <DiscoveryDeviceList devices={deviceList} handleSelect={setSelectedDevice} selection={selectedDevice}/>
      <DiscoveryButtonPanel setDiscovery={setDiscovering} setDevices={setDeviceList} setConnected={setConnected} 
        isDiscovering={discovering} selection={selectedDevice} connectedDevice={connectedDevice} connectionAddresses={connectionAddresses} 
        setConnectionAddresses={setConnectionAddresses}/>
    </View>
  );
}


function ChatButtonPanel({message, setMessage, setReceived, connectedDevice, connectionAddresses, setConnectionAddresses}) {
  function handleSend() {
    if (connectedDevice !== null) {
      wifiP2P.getConnectionInfo().then((info) => {
        console.log(info)
        if (info.isGroupOwner) {
          connectionAddresses.forEach(address => {
            wifiP2P.sendMessageTo(message, address).then((meta) => 
            console.log("Message sent to", address, ":" , meta.message))
            .catch((err) => console.log("Message to", address, " failed with:", err))
            setMessage(null);
          });
        }

        else if (!info.isGroupOwner) {
          wifiP2P.sendMessage(message).then((meta) => 
          console.log("Message sent:" , meta.message))
          .catch((err) => console.log("Message failed with:", err))
          setMessage(null);
        }
      });
    }
  }

  function handleReceive() {
    wifiP2P.getConnectionInfo().then((info) => {
      console.log(info);
      console.log("Trying to receive from:", connectedDevice);
    
      if ((connectedDevice !== null)) {
        wifiP2P.receiveMessage({meta: true}).then(({fromAddress, message}) => {
          console.log("Message received from:", fromAddress);
          setReceived(message);
          if (info.isGroupOwner) {
            if (connectionAddresses !== null && connectionAddresses.includes(fromAddress))
            console.log("GO address list:", connectionAddresses);
            else {
              setConnectionAddresses([...connectionAddresses, fromAddress]);
              console.log("GO address list:", connectionAddresses);
            }
          }
          }).catch((err) => console.log("Message could not be received. ", err));
      }});
  }

  return (
  <View style={{...styles.ButtonPanel}}>
    <Button primary={true}
            onPress={handleSend}>
      <Text style={styles.buttonText}>Send</Text>
    </Button>

    <Button primary={true}
            onPress={handleReceive}>
      <Text style={styles.buttonText}>Receive</Text>
    </Button>
  </View>
  );
}

function ChatReceiving({receivedMessage}) {
  const placeholder = "Received message will show here.";
  
  return (
    <View style={{marginBottom: 20}}>
      <Text style={styles.body}>{(receivedMessage === null) ? placeholder : receivedMessage}</Text>
    </View>
  );
}

function ChatPanel({connectedDevice, setConnectionAddresses, connectionAddresses}) {
  const [message, setMessage] = useState(null); // message to be sent
  const [received, setReceived] = useState(null); // message received

  return (
    <View style={styles.chatPanel}>
      <ChatReceiving receivedMessage={received}/>
      <TextInput style={styles.textInputBox} 
                 placeholder='Message'
                 onChangeText={setMessage}
                 value={message}/>
      <ChatButtonPanel message={message} setMessage={setMessage} connectedDevice={connectedDevice} setReceived={setReceived} 
        setConnectionAddresses={setConnectionAddresses} connectionAddresses={connectionAddresses}></ChatButtonPanel>
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
  
  const [connectedDevice, setConnected] = useState(null);
  const [connectionAddresses, setConnectionAddresses] = useState([]);

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
        <DiscoveryPanel connectedDevice={connectedDevice} setConnected={setConnected} setConnectionAddresses={setConnectionAddresses} connectionAddresses={connectionAddresses}> </DiscoveryPanel>
        <ChatPanel connectedDevice={connectedDevice} connectionAddresses={connectionAddresses} setConnectionAddresses={setConnectionAddresses}></ChatPanel>
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

  ButtonPanel: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "center",
    marginVertical: 20,
  },

  textInputBox: {
    width: "100%",
    height: 40,
    paddingHorizontal: 5,
    ...Boxes.roundedBorder,
  },

  chatPanel: {
    flex: 2,
    width: "100%",
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

  buttonText: {
    ...Typography.body, 
    color: Colors.white
  }
});
