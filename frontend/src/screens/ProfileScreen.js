import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen() {
  const { user, signOut, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleUpdate = async () => {
    if (!name || !email) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      await updateUser(name, email);
      setEditing(false);
      Alert.alert('Sucesso', 'Perfil atualizado');
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Perfil</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputDisabled]}
            value={name}
            onChangeText={setName}
            editable={editing}
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputDisabled]}
            value={email}
            onChangeText={setEmail}
            editable={editing}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />

          {editing ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setEditing(false);
                  setName(user.name);
                  setEmail(user.email);
                }}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton, loading && styles.buttonDisabled]}
                onPress={handleUpdate}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() => setEditing(true)}
            >
              <Text style={styles.buttonText}>Editar Perfil</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#C85A8E',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#C85A8E',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#FFF0F5',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#FFB6D9',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  editButton: {
    backgroundColor: '#C85A8E',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    flex: 1,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#999',
    flex: 1,
    marginRight: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#F44336',
    marginTop: 30,
  },
  logoutButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
