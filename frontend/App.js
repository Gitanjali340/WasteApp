import * as React from 'react';
import { Text, View, TextInput, Button, StyleSheet, Image, ScrollView, Animated, Dimensions } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';

const { width, height } = Dimensions.get('window');

const ads = [
  {
    quote: '🌱 Get your eco-friendly dustbin now! Start your journey towards cleaner surroundings.',
    image: require('./assets/nature1.jpg')
  },
  {
    quote: '♻️ Recycling starts with you! One can can save enough energy to power a TV for 3 hours.',
    image: require('./assets/nature2.jpg')
  },
  {
    quote: '🚮 Waste less, live more! Dispose of waste responsibly to help preserve our planet.',
    image: require('./assets/nature3.jpg')
  },
  {
    quote: '🗑️ Segregate wet and dry waste for efficient recycling and composting.',
    image: require('./assets/nature4.jpg')
  },
  {
    quote: '🌍 Join community clean-up drives and make a difference in your neighborhood.',
    image: require('./assets/nature5.jpg')
  },
];

function HomeScreen() {
  const [index, setIndex] = React.useState(0);
  const translateX = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const timer = setInterval(() => {
      Animated.timing(translateX, {
        toValue: -width,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setIndex((prev) => (prev + 1) % ads.length);
        translateX.setValue(width);
        Animated.timing(translateX, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.fullscreen}>
      <Animated.View style={[styles.adFullscreenContainer, { transform: [{ translateX }] }]}>
        <Image source={ads[index].image} style={styles.fullscreenImage} />
        <View style={styles.overlay}>
          <Text style={styles.adFullscreenText}>{ads[index].quote}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

function AnalysisScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>📊 Company Analysis</Text>
      <Text style={styles.text}>Charts and data visualization about garbage collection efficiency will be here.</Text>
    </View>
  );
}

function BuyBinScreen() {
  const [name, setName] = React.useState('');
  const [address, setAddress] = React.useState('');

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://192.168.0.9:3000/api/buy-bin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, address })
      });
      const data = await response.text();
      alert(data);
    } catch (error) {
      alert('Error sending request');
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.heading}>🗑️ Request a Garbage Bin</Text>
      <TextInput style={styles.input} placeholder="Your Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress} />
      <Button title="Submit Request" onPress={handleSubmit} />
    </ScrollView>
  );
}

function ComplaintsScreen() {
  const [subject, setSubject] = React.useState('');
  const [description, setDescription] = React.useState('');

  const handleComplaint = async () => {
    try {
      const response = await fetch('http://192.168.0.9:3000/api/complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, description })
      });
      const data = await response.text();
      alert(data);
    } catch (error) {
      alert('Error sending complaint');
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.heading}>📮 Complaint Box</Text>
      <TextInput style={styles.input} placeholder="Subject" value={subject} onChangeText={setSubject} />
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Describe your issue..."
        multiline
        value={description}
        onChangeText={setDescription}
      />
      <Button title="Submit Complaint" onPress={handleComplaint} />
    </ScrollView>
  );
}

function ProfileScreen() {
  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.heading}>👤 Your Profile</Text>
      <Image
        source={require('./assets/profile.jpg')}
        style={styles.profileImage}
      />
      <Text style={styles.profileText}>Name: Gitanjali Pandey</Text>
      <Text style={styles.profileText}>Role: Society Member</Text>
      <Text style={styles.profileText}>Requests Made: 3</Text>
      <Button title="Edit Profile" />
    </ScrollView>
  );
}

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <Image
          source={require('./assets/profile.jpg')}
          style={styles.drawerProfileImage}
        />
        <Text style={styles.drawerProfileName}>Gitanjali Pandey</Text>
        <Button title="View Profile" onPress={() => props.navigation.navigate('Profile')} />
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

const Drawer = createDrawerNavigator();

export default function App() {
  const CustomTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#ffffff',
      text: '#000000',
      card: '#f2f2f2',
      border: '#ccc',
    },
  };

  return (
    <NavigationContainer theme={CustomTheme}>
      <Drawer.Navigator
        initialRouteName="Home"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Analysis" component={AnalysisScreen} />
        <Drawer.Screen name="Buy Bin" component={BuyBinScreen} />
        <Drawer.Screen name="Complaints" component={ComplaintsScreen} />
        <Drawer.Screen name="Profile" component={ProfileScreen} options={{ drawerItemStyle: { height: 0 } }} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
    marginTop: 50,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#4CAF50',
  },
  text: {
    fontSize: 16,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  profileText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  fullscreen: {
    flex: 1,
  },
  adFullscreenContainer: {
    width: width,
    height: height,
    position: 'relative',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 20,
  },
  adFullscreenText: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  drawerHeader: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  drawerProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  drawerProfileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
