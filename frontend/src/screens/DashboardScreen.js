import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { reportService } from '../services/api';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);

  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reportService.getDashboard(month, year);
      setDashboard(data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const getChartData = () => {
    if (!dashboard || !dashboard.categoryBreakdown || dashboard.categoryBreakdown.length === 0) {
      return [];
    }

    const expenses = dashboard.categoryBreakdown.filter(item => item.type === 'expense');
    
    const colors = ['#C85A8E', '#E88BB0', '#FFB6D9', '#D06B95', '#B84678', '#FF99C8', '#E07AAD'];
    
    return expenses.map((item, index) => ({
      name: item.category,
      population: parseFloat(item.total),
      color: colors[index % colors.length],
      legendFontColor: '#333',
      legendFontSize: 12,
    }));
  };

  const chartData = getChartData();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const changeMonth = (delta) => {
    let newMonth = month + delta;
    let newYear = year;

    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }

    setMonth(newMonth);
    setYear(newYear);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadDashboard} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <View style={styles.dateSelector}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => changeMonth(-1)}
          >
            <Text style={styles.dateButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.dateText}>
            {monthNames[month - 1]} {year}
          </Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => changeMonth(1)}
          >
            <Text style={styles.dateButtonText}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      {dashboard && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Saldo Total</Text>
            <Text style={[styles.balance, dashboard.balance.total >= 0 ? styles.positive : styles.negative]}>
              R$ {dashboard.balance.total.toFixed(2)}
            </Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.smallCard, styles.incomeCard]}>
              <Text style={styles.smallCardTitle}>Receitas do Mês</Text>
              <Text style={styles.smallCardValue}>
                R$ {dashboard.monthly.income.toFixed(2)}
              </Text>
            </View>

            <View style={[styles.smallCard, styles.expenseCard]}>
              <Text style={styles.smallCardTitle}>Despesas do Mês</Text>
              <Text style={styles.smallCardValue}>
                R$ {dashboard.monthly.expense.toFixed(2)}
              </Text>
            </View>
          </View>

          {chartData.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Gastos por Categoria</Text>
              <PieChart
                data={chartData}
                width={screenWidth - 40}
                height={220}
                chartConfig={{
                  color: (opacity = 1) => `rgba(200, 90, 142, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
          )}

          {chartData.length === 0 && (
            <View style={styles.card}>
              <Text style={styles.emptyText}>
                Nenhuma despesa registrada neste mês
              </Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#C85A8E',
    marginBottom: 15,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateButton: {
    padding: 10,
    backgroundColor: '#C85A8E',
    borderRadius: 8,
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C85A8E',
    marginHorizontal: 20,
    textTransform: 'capitalize',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    textTransform: 'capitalize',
  },
  card: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  balance: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  smallCard: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    margin: 5,
  },
  incomeCard: {
    backgroundColor: '#E8F5E9',
  },
  expenseCard: {
    backgroundColor: '#FFEBEE',
  },
  smallCardTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  smallCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
  },
});
