import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { apiFetch } from '@/lib/api';
import { RecipeCard } from '@/components/RecipeCard';
import { useAuth } from '@/context/AuthContext';
import type { RecipeSummary } from '@recipehub/shared';

export default function FavoritesScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    apiFetch<{ recipes: RecipeSummary[] }>(`/api/users/${user.id}`)
      .then((res) => {
        setRecipes(res.data?.recipes ?? []);
      })
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  if (!user && !authLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Log in to see your favorites.</Text>
        <Text style={styles.link} onPress={() => router.push('/(auth)/login')}>
          Log in →
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d97706" />
      </View>
    );
  }

  return (
    <FlatList
      data={recipes}
      keyExtractor={(r) => r.id}
      renderItem={({ item }) => (
        <RecipeCard
          recipe={item}
          onPress={() => router.push(`/(app)/recipes/${item.id}`)}
        />
      )}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.message}>No favorites yet.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  message: { fontSize: 16, color: '#9ca3af' },
  link: { fontSize: 16, color: '#d97706', marginTop: 12 },
  list: { padding: 16 },
});
