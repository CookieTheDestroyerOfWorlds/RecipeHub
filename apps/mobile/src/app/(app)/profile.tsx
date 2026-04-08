import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>You're not logged in.</Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.link}>Log in →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleLogout = async () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(app)/recipes');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user.displayName ?? user.username).charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user.displayName ?? user.username}</Text>
        <Text style={styles.username}>@{user.username}</Text>
        {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
        {user.role === 'admin' && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>Admin</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Email</Text>
          <Text style={styles.itemValue}>{user.email}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Username</Text>
          <Text style={styles.itemValue}>{user.username}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  message: { fontSize: 16, color: '#9ca3af' },
  link: { fontSize: 16, color: '#d97706', marginTop: 12 },
  header: { backgroundColor: '#fff', alignItems: 'center', padding: 32, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#92400e' },
  name: { fontSize: 22, fontWeight: '700', color: '#111827' },
  username: { fontSize: 14, color: '#9ca3af', marginTop: 2 },
  bio: { fontSize: 14, color: '#6b7280', marginTop: 8, textAlign: 'center' },
  adminBadge: { marginTop: 8, backgroundColor: '#fee2e2', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 },
  adminBadgeText: { fontSize: 12, color: '#b91c1c', fontWeight: '600' },
  section: { backgroundColor: '#fff', marginTop: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e5e7eb' },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  item: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  itemLabel: { fontSize: 15, color: '#374151' },
  itemValue: { fontSize: 15, color: '#9ca3af' },
  logoutBtn: { margin: 24, backgroundColor: '#fee2e2', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  logoutBtnText: { fontSize: 16, fontWeight: '600', color: '#b91c1c' },
});
