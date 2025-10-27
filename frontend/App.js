import React from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import ProfileScreen from './src/screens/ProfileScreen';

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Stack = createStackNavigator();

function BottomTabs({ currentRoute }) {
  const navigation = useNavigation();

  return (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => navigation.navigate('Dashboard')}
      >
        <Text
          style={[
            styles.tabText,
            currentRoute === 'Dashboard' && styles.tabTextActive,
          ]}
        >
          Dashboard
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => navigation.navigate('Transactions')}
      >
        <Text
          style={[
            styles.tabText,
            currentRoute === 'Transactions' && styles.tabTextActive,
          ]}
        >
          Transações
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text
          style={[
            styles.tabText,
            currentRoute === 'Profile' && styles.tabTextActive,
          ]}
        >
          Perfil
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  const [currentRoute, setCurrentRoute] = React.useState('Dashboard');

  return (
    <>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        screenListeners={{
          state: (e) => {
            const route = e.data.state.routes[e.data.state.index];
            setCurrentRoute(route.name);
          },
        }}
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Transactions" component={TransactionsScreen} />
        <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
      <BottomTabs currentRoute={currentRoute} />
    </>
  );
}

function Navigation() {
  const { signed, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {signed ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF0F5',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#FFB6D9',
    paddingBottom: 20,
    paddingTop: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#C85A8E',
    fontWeight: 'bold',
  },
});
