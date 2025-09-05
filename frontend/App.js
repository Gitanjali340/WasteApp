import * as React from 'react';
import {
  Text,
  View,
  TextInput,
  Button,
  StyleSheet,
  Image,
  ScrollView,
  Animated,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  Alert,
  LogBox,
  FlatList,
  Modal,
  Platform
} from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import DateTimePicker from '@react-native-community/datetimepicker';

// Hides the non-critical warning from navigation libraries
LogBox.ignoreLogs([
  'useInsertionEffect must not schedule updates',
]);

const { width, height } = Dimensions.get('window');
// NOTE: Make sure this is your computer's current IP address.
const API_URL = 'http://192.168.0.7:3000';

const ads = [
  { quote: '🌱 Get your eco-friendly dustbin now! Start your journey towards cleaner surroundings.', image: require('./assets/nature1.jpg') },
  { quote: '♻️ Recycling starts with you! One can can save enough energy to power a TV for 3 hours.', image: require('./assets/nature2.jpg') },
  { quote: '🚮 Waste less, live more! Dispose of waste responsibly to help preserve our planet.', image: require('./assets/nature3.jpg') },
  { quote: '🗑️ Segregate wet and dry waste for efficient recycling and composting.', image: require('./assets/nature4.jpg') },
  { quote: '🌍 Join community clean-up drives and make a difference in your neighborhood.', image: require('./assets/nature5.jpg') },
];

const showAlert = (title, message) => Alert.alert(title, message);

// --- Role Selection Screen ---
function RoleSelectionScreen({ navigation }) {
  const navigateToLogin = (role) => {
    navigation.navigate('Login', { role }); 
  };

  return (
    <ImageBackground 
        source={require('./assets/nature1.jpg')} 
        style={styles.roleSelectionBackground}
        blurRadius={2}
    >
      <View style={styles.roleSelectionOverlay}>
        <Text style={styles.roleSelectionHeading}>Welcome!</Text>
        <Text style={styles.roleSelectionSubHeading}>Please select your role to continue</Text>

        <View style={styles.roleButtonContainer}>
          <TouchableOpacity style={styles.roleButton} onPress={() => navigateToLogin('society-member')}>
            <Text style={styles.roleButtonText}>👤 I am a Society-Member</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.roleButton} onPress={() => navigateToLogin('employee')}>
            <Text style={styles.roleButtonText}>🧑‍🔧 I am an Employee</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.roleButton} onPress={() => navigateToLogin('manager')}>
            <Text style={styles.roleButtonText}>👔 I am a Manager</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.roleButton} onPress={() => navigateToLogin('owner')}>
            <Text style={styles.roleButtonText}>👑 I am an Owner</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerLink}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

// --- App Screens ---
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
  }, [translateX]);

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
      <Text style={styles.text}>Charts and data about garbage collection will be here.</Text>
    </View>
  );
}

// --- Screens for Task Management ---

function ManageEmployeesScreen({ navigation, route }) {
    const { user } = route.params;
    const [employees, setEmployees] = React.useState([]);

    React.useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await fetch(`${API_URL}/api/users/employees`);
                const data = await response.json();
                if (data.success) {
                    setEmployees(data.employees);
                } else {
                    showAlert('Error', 'Could not fetch employees.');
                }
            } catch (error) {
                showAlert('Network Error', 'Could not connect to server.');
            }
        };
        fetchEmployees();
    }, []);
    
    return (
        <View style={styles.screen}>
            <Text style={styles.heading}>👥 Manage Employees</Text>
            <FlatList
                data={employees}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        style={styles.employeeCard} 
                        onPress={() => navigation.navigate('EmployeeDetail', { employee: item, manager: user })}
                    >
                        <Text style={styles.employeeName}>{item.username}</Text>
                        <Text>&rarr;</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.text}>No employees found.</Text>}
            />
        </View>
    );
}

function EmployeeDetailScreen({ route }) {
    const { employee, manager } = route.params;
    const [tasks, setTasks] = React.useState([]);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [taskDescription, setTaskDescription] = React.useState('');
    const [date, setDate] = React.useState(new Date());
    const [showPicker, setShowPicker] = React.useState(false);
    const [deadline, setDeadline] = React.useState('');

    const fetchTasks = async () => {
        try {
            const response = await fetch(`${API_URL}/api/tasks/${employee.username}`);
            const data = await response.json();
            if (data.success) setTasks(data.tasks);
            else showAlert('Error', 'Could not fetch tasks.');
        } catch (error) {
            showAlert('Network Error', 'Could not connect to server.');
        }
    };

    React.useEffect(() => { fetchTasks(); }, [employee.username]);

    const handleAssignTask = async () => {
        if (!taskDescription.trim() || !deadline.trim()) {
            showAlert('Input Error', 'Please enter a task description and a deadline.');
            return;
        }
        try {
            const response = await fetch(`${API_URL}/api/tasks/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: taskDescription,
                    assignedTo: employee.username,
                    assignedBy: manager.name, 
                    deadline: deadline,
                }),
            });
            const data = await response.json();
            if (data.success) {
                showAlert('Success', `Task assigned to ${employee.username}.`);
                setTaskDescription('');
                setDeadline('');
                setDate(new Date());
                setModalVisible(false);
                fetchTasks();
            } else {
                showAlert('Error', data.message || 'Failed to assign task.');
            }
        } catch (error) {
            showAlert('Network Error', 'Could not assign task.');
        }
    };
    
    const onDateChange = (event, selectedDate) => {
        setShowPicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDate(selectedDate);
            let tempDate = new Date(selectedDate);
            let fDate = tempDate.getFullYear() + '-' + ('0' + (tempDate.getMonth() + 1)).slice(-2) + '-' + ('0' + tempDate.getDate()).slice(-2);
            setDeadline(fDate);
        }
    };

    const getStatusStyle = (status) => {
        if (status === 'completed') return styles.statusCompleted;
        if (status === 'late') return styles.statusLate;
        return styles.statusPending;
    };

    return (
        <View style={styles.screen}>
            <Button title="Assign New Task" onPress={() => setModalVisible(true)} />
            <Text style={styles.subHeading}>Task History</Text>
            <FlatList
                data={tasks}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.taskCard}>
                        <Text style={styles.taskDescription}>{item.description}</Text>
                        <Text style={styles.taskDeadline}>Deadline: {new Date(item.deadline).toLocaleDateString()}</Text>
                         <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={styles.taskStatus}>Status: </Text>
                            <Text style={getStatusStyle(item.status)}>{item.status.toUpperCase()}</Text>
                        </View>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.text}>No tasks assigned yet.</Text>}
            />
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Assign Task to {employee.username}</Text>
                        <TextInput style={styles.input} placeholder="Task description..." value={taskDescription} onChangeText={setTaskDescription} />
                        
                        <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.datePickerButton}>
                            <Text style={styles.datePickerButtonText}>{deadline ? deadline : 'Select a Deadline'}</Text>
                        </TouchableOpacity>

                        {showPicker && (
                            <DateTimePicker
                                testID="dateTimePicker"
                                value={date}
                                mode={'date'}
                                is24Hour={true}
                                display="default"
                                onChange={onDateChange}
                            />
                        )}

                        <View style={styles.modalButtons}>
                            <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
                            <Button title="Assign" onPress={handleAssignTask} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}


function EmployeeTasksScreen({ route }) {
    const { user } = route.params;
    const [tasks, setTasks] = React.useState([]);

    const fetchTasks = async () => {
        try {
            const response = await fetch(`${API_URL}/api/tasks/${user.name}`);
            const data = await response.json();
            if (data.success) {
                setTasks(data.tasks);
            } else {
                showAlert('Error', 'Could not fetch tasks.');
            }
        } catch (error) {
            showAlert('Network Error', 'Could not connect to server.');
        }
    };

    React.useEffect(() => {
        fetchTasks();
    }, [user.name]);

    const handleMarkAsDone = async (taskId) => {
        try {
            const response = await fetch(`${API_URL}/api/tasks/${taskId}/complete`, {
                method: 'PATCH',
            });
            const data = await response.json();
            if (data.success) {
                showAlert('Success', 'Task marked as completed!');
                fetchTasks();
            } else {
                showAlert('Error', data.message || 'Could not update task.');
            }
        } catch (error) {
            showAlert('Network Error', 'Could not connect to server.');
        }
    };

    const getStatusStyle = (status) => {
        if (status === 'completed') return styles.statusCompleted;
        if (status === 'late') return styles.statusLate;
        return styles.statusPending;
    };

    return (
        <View style={styles.screen}>
            <Text style={styles.heading}>📋 My Assigned Tasks</Text>
            <FlatList
                data={tasks}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.taskCard}>
                        <Text style={styles.taskDescription}>{item.description}</Text>
                        <Text style={styles.taskDeadline}>Deadline: {new Date(item.deadline).toLocaleDateString()}</Text>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Text style={styles.taskStatus}>Status: </Text>
                            <Text style={getStatusStyle(item.status)}>{item.status.toUpperCase()}</Text>
                        </View>
                        {item.status !== 'completed' && (
                            <View style={{marginTop: 10}}>
                                <Button title="Mark as Done" onPress={() => handleMarkAsDone(item._id)} color="#28a745" />
                            </View>
                        )}
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.text}>You have no assigned tasks.</Text>}
            />
        </View>
    );
}


function BuyBinScreen() { return (<ScrollView contentContainerStyle={styles.screen}><Text style={styles.heading}>Request a Garbage Bin</Text><TextInput style={styles.input} placeholder="Your Name" /><TextInput style={styles.input} placeholder="Address" /><Button title="Submit Request" /></ScrollView>); }
function ComplaintsScreen() { return (<ScrollView contentContainerStyle={styles.screen}><Text style={styles.heading}>Complaint Box</Text><TextInput style={styles.input} placeholder="Subject" /><TextInput style={[styles.input, { height: 80 }]} placeholder="Describe your issue..." multiline /><Button title="Submit Complaint" /></ScrollView>); }

function ProfileScreen({ route }) {
    const { user } = route.params;
    return (<ScrollView contentContainerStyle={styles.screen}><Text style={styles.heading}>Your Profile</Text><Image source={require('./assets/profile.jpg')} style={styles.profileImage} /><Text style={styles.profileTextLabel}>Username:</Text><TextInput style={styles.input} value={user.name} editable={false} /><Text style={styles.profileTextLabel}>Role:</Text><TextInput style={[styles.input, { backgroundColor: '#e0e0e0', color: '#555' }]} value={user.role} editable={false} /></ScrollView>);
}

function LoginScreen({ route, navigation }) {
  const { role } = route.params; 
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleLogin = async () => {
    if (!username || !password) {
        showAlert('Input Required', 'Please enter your username and password.');
        return;
    }
    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role }),
        });
        const data = await response.json();
        if (data.success) {
            navigation.replace('Main', { user: { name: data.user.username, role: data.user.role } });
        } else {
            showAlert('Login Failed', data.message || 'Please check your credentials.');
        }
    } catch (err) {
        showAlert('Network Error', 'Could not connect to the server. Please try again.');
    }
  };

  const displayRole = role.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>🔐 Login as {displayRole}</Text>
      <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

function RegisterScreen({ navigation }) {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const handleRegister = async () => { /* ... */ };
    return (
      <View style={styles.screen}>
        <Text style={styles.heading}>📝 Register</Text>
        <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none"/>
        <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword}/>
        <Button title="Register" onPress={handleRegister} />
      </View>
    );
}

function CustomDrawerContent(props) {
  const user = props.route?.params?.user || { name: 'Guest', role: 'Visitor' };
  const handleLogout = () => props.navigation.replace('RoleSelection');

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, justifyContent: 'space-between' }}>
      <View>
        <View style={styles.drawerHeader}>
          <Image source={require('./assets/profile.jpg')} style={styles.drawerProfileImage} />
          <Text style={styles.drawerProfileName}>{user.name}</Text>
          <Button title="View Profile" onPress={() => props.navigation.navigate('Profile', { user })} />
        </View>
        <DrawerItemList {...props} />
      </View>
      <View style={{ padding: 20, borderTopWidth: 1, borderColor: '#ccc' }}>
        <Button title="🚪 Logout" color="#f44336" onPress={handleLogout} />
      </View>
    </DrawerContentScrollView>
  );
}

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function MainDrawer({ route }) {
    const { user } = route.params;
    const role = user?.role?.toLowerCase();
    const drawerContent = (props) => <CustomDrawerContent {...props} route={route} />;
  
    switch (role) {
      case 'owner':
        return (
          <Drawer.Navigator initialRouteName="Home" drawerContent={drawerContent}>
            <Drawer.Screen name="Home" component={HomeScreen} />
            <Drawer.Screen name="Manage Employees" component={ManageEmployeesScreen} initialParams={{ user }} />
            <Drawer.Screen name="Analysis" component={AnalysisScreen} />
            <Drawer.Screen name="Buy Bin" component={BuyBinScreen} />
            <Drawer.Screen name="Complaints" component={ComplaintsScreen} />
          </Drawer.Navigator>
        );
      case 'manager':
        return (
          <Drawer.Navigator initialRouteName="Home" drawerContent={drawerContent}>
            <Drawer.Screen name="Home" component={HomeScreen} />
            <Drawer.Screen name="Manage Employees" component={ManageEmployeesScreen} initialParams={{ user }} />
            <Drawer.Screen name="Buy Bin" component={BuyBinScreen} />
            <Drawer.Screen name="Complaints" component={ComplaintsScreen} />
          </Drawer.Navigator>
        );
      case 'employee':
        return (
          <Drawer.Navigator initialRouteName="Home" drawerContent={drawerContent}>
            <Drawer.Screen name="Home" component={HomeScreen} />
            <Drawer.Screen name="My Tasks" component={EmployeeTasksScreen} initialParams={{ user }} />
          </Drawer.Navigator>
        );
      case 'society-member':
      default:
        return (
          <Drawer.Navigator initialRouteName="Home" drawerContent={drawerContent}>
            <Drawer.Screen name="Home" component={HomeScreen} />
            <Drawer.Screen name="Buy Bin" component={BuyBinScreen} />
            <Drawer.Screen name="Complaints" component={ComplaintsScreen} />
          </Drawer.Navigator>
        );
    }
}

// --- Main App Navigator ---
export default function App() {
  const CustomTheme = {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, background: '#ffffff' },
  };

  return (
    <NavigationContainer theme={CustomTheme}>
      <Stack.Navigator 
        initialRouteName="RoleSelection" 
        screenOptions={{
            headerStyle: { backgroundColor: '#4CAF50' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} options={{ headerShown: false }}/>
        <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={({ route }) => {
                const role = route.params?.role ?? '';
                const displayRole = role.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                return { title: `Login as ${displayRole}` };
            }}
        />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
        <Stack.Screen name="Main" component={MainDrawer} options={{ headerShown: false }}/>
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Your Profile' }} />
        <Stack.Screen 
            name="EmployeeDetail" 
            component={EmployeeDetailScreen} 
            options={({ route }) => ({ title: `${route.params.employee.username}'s Tasks` })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  screen: { flexGrow: 1, padding: 20, alignItems: 'center' },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#4CAF50', textAlign: 'center' },
  subHeading: { fontSize: 20, fontWeight: 'bold', marginVertical: 15, color: '#333', textAlign: 'center' },
  text: { fontSize: 16, marginBottom: 12, textAlign: 'center', color: '#333' },
  input: { width: '100%', borderWidth: 1, borderColor: '#aaa', borderRadius: 6, padding: 12, marginBottom: 15, fontSize: 16 },
  profileImage: { width: 150, height: 150, borderRadius: 75, alignSelf: 'center', marginBottom: 20, borderWidth: 3, borderColor: '#4CAF50' },
  profileTextLabel: { fontSize: 16, color: '#333', alignSelf: 'flex-start', marginBottom: 5, fontWeight: 'bold' },
  fullscreen: { flex: 1 },
  adFullscreenContainer: { width: width, height: height, position: 'relative' },
  fullscreenImage: { width: '100%', height: '100%', position: 'absolute' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.4)', padding: 20 },
  adFullscreenText: { fontSize: 24, color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  drawerHeader: { alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  drawerProfileImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  drawerProfileName: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  roleSelectionBackground: { flex: 1, width: '100%', height: '100%' },
  roleSelectionOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  roleSelectionHeading: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 10, textAlign: 'center' },
  roleSelectionSubHeading: { fontSize: 18, color: '#eee', marginBottom: 40, textAlign: 'center' },
  roleButtonContainer: { width: '80%', maxWidth: 300 },
  roleButton: { backgroundColor: '#4CAF50', paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15, elevation: 5 },
  roleButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  registerLink: { marginTop: 20, color: '#fff', fontSize: 16, textDecorationLine: 'underline' },
  employeeCard: { width: '100%', padding: 15, marginVertical: 8, backgroundColor: '#f9f9f9', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  employeeName: { fontSize: 16, fontWeight: 'bold' },
  taskCard: { width: '100%', padding: 15, marginVertical: 8, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#eee', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.22, shadowRadius: 2.22, elevation: 3 },
  taskDescription: { fontSize: 16, marginBottom: 5 },
  taskDeadline: { fontSize: 14, color: '#666', marginBottom: 8 },
  taskStatus: { fontSize: 14, color: '#888' },
  statusPending: { color: '#007bff', fontWeight: 'bold' },
  statusCompleted: { color: '#28a745', fontWeight: 'bold' },
  statusLate: { color: '#dc3545', fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { width: '80%', backgroundColor: 'white', borderRadius: 20, padding: 35, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { fontSize: 20, marginBottom: 15, textAlign: 'center', fontWeight: 'bold' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 20 },
  datePickerButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    justifyContent: 'center',
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#000',
  }
});

