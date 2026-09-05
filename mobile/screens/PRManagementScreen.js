import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../services/api';

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
};

export default function PRManagementScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(''); // Empty means all

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/purchase-requests?status=${statusFilter}` : '/purchase-requests';
      const response = await api.get(url);
      setRequests(response.data.purchaseRequests || []);
      
      if (!statusFilter) {
        setAllRequests(response.data.purchaseRequests || []);
      }
    } catch (error) {
      console.error('Error fetching PRs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusCount = (status) => {
    if (!status) return allRequests.length;
    return allRequests.filter(r => r.status?.toUpperCase() === status.toUpperCase()).length;
  };

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': 
      case 'PENDING ADMIN PROCESSING':
        return { bg: '#ffedd5', text: '#ea580c', border: '#f97316' }; // Soft Orange
      case 'APPROVED': 
        return { bg: '#dcfce7', text: '#15803d', border: '#22c55e' }; // Soft Green
      case 'REJECTED': 
        return { bg: '#fee2e2', text: '#b91c1c', border: '#ef4444' }; // Soft Red
      default: 
        return { bg: '#f3f4f6', text: '#4b5563', border: '#9ca3af' }; // Soft Gray
    }
  };

  const renderItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);
    return (
      <TouchableOpacity 
        style={[styles.card, { borderLeftColor: statusStyle.border, borderLeftWidth: 4 }]}
        onPress={() => navigation.navigate('PRDetail', { prId: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.pr_number || `PR #${item.id}`}</Text>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.text }]}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.cardDescription}>{item.purpose || 'No purpose provided'}</Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.row}>
            <MaterialIcons name="person" size={14} color="#9ca3af" style={{ marginRight: 4 }} />
            <View>
              <Text style={styles.requesterText}>{item.first_name} {item.last_name}</Text>
              <Text style={styles.timeText}>{timeAgo(item.created_at || Date.now())}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <MaterialIcons name="payments" size={16} color="#4b5563" style={{ marginRight: 4 }} />
            <Text style={styles.cardAmount}>₱{parseFloat(item.total_amount).toFixed(2)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['', 'PENDING', 'FOR APPROVAL', 'APPROVED', 'REJECTED'].map((status) => {
            const count = getStatusCount(status);
            return (
              <TouchableOpacity 
                key={status}
                style={[styles.filterChip, statusFilter === status && styles.filterChipActive]}
                onPress={() => setStatusFilter(status)}
              >
                <Text style={[styles.filterText, statusFilter === status && styles.filterTextActive]}>
                  {status || 'ALL'} {count > 0 && `(${count})`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FFBF00" />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No requests found</Text>}
        />
      )}
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  filters: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: '#FFBF00',
    borderColor: '#FFBF00',
  },
  filterText: {
    color: '#64748b',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 15,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardDescription: {
    color: '#6b7280',
    marginBottom: 15,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requesterText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  timeText: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#334155',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#6b7280',
    fontSize: 16,
  }
});
