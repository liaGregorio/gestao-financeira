import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { transactionService } from '../services/api';

export default function TransactionsScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const filters = filter !== 'all' ? { type: filter } : {};
      const data = await transactionService.getAll(filters);
      setTransactions(data);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTransactions();
    });
    return unsubscribe;
  }, [navigation, loadTransactions]);

  const handleDelete = async (id) => {
    Alert.alert(
      'Confirmar exclusão',
      'Deseja realmente excluir esta transação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await transactionService.delete(id);
              loadTransactions();
              Alert.alert('Sucesso', 'Transação excluída');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a transação');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={() => navigation.navigate('AddTransaction', { transaction: item })}
      onLongPress={() => handleDelete(item.id)}
    >
      <View style={styles.transactionInfo}>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.date}>
          {new Date(item.date).toLocaleDateString('pt-BR')}
        </Text>
      </View>
      <Text
        style={[
          styles.amount,
          item.type === 'income' ? styles.income : styles.expense,
        ]}
      >
        {item.type === 'income' ? '+' : '-'} R$ {parseFloat(item.amount).toFixed(2)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transações</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddTransaction')}
        >
          <Text style={styles.addButtonText}>+ Nova</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Todas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'income' && styles.filterActive]}
          onPress={() => setFilter('income')}
        >
          <Text style={[styles.filterText, filter === 'income' && styles.filterTextActive]}>
            Receitas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'expense' && styles.filterActive]}
          onPress={() => setFilter('expense')}
        >
          <Text style={[styles.filterText, filter === 'expense' && styles.filterTextActive]}>
            Despesas
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadTransactions} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#C85A8E',
  },
  addButton: {
    backgroundColor: '#C85A8E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFB6D9',
  },
  filterActive: {
    backgroundColor: '#C85A8E',
    borderColor: '#C85A8E',
  },
  filterText: {
    color: '#C85A8E',
    fontWeight: 'bold',
  },
  filterTextActive: {
    color: '#fff',
  },
  list: {
    padding: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionInfo: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  income: {
    color: '#4CAF50',
  },
  expense: {
    color: '#F44336',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 50,
  },
});
