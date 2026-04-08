import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { apiFetch } from '@/lib/api';
import { RecipeCard } from '@/components/RecipeCard';
import { useAuth } from '@/context/AuthContext';
import type { RecipeSummary, PaginatedResponse } from '@recipehub/shared';

export default function RecipesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchRecipes = useCallback(
    async (q: string, p: number, reset = false) => {
      const params = new URLSearchParams({ page: String(p), limit: '20' });
      if (q) params.set('q', q);
      const result = await apiFetch<PaginatedResponse<RecipeSummary>>(`/api/recipes?${params}`, {
        skipAuth: true,
      });
      if (result.data) {
        setRecipes((prev) => (reset ? result.data!.items : [...prev, ...result.data!.items]));
        setHasMore(result.data.hasMore);
      }
      setLoading(false);
      setRefreshing(false);
    },
    []
  );

  useEffect(() => {
    setLoading(true);
    fetchRecipes(query, 1, true);
    setPage(1);
  }, [query, fetchRecipes]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecipes(query, 1, true);
    setPage(1);
  };

  const onEndReached = () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRecipes(query, nextPage);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder="Search recipes…"
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
        />
        {user && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push('/(app)/recipes/new')}
          >
            <Text style={styles.addBtnText}>＋</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#d97706" />
        </View>
      ) : (
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.empty}>No recipes found.</Text>
            </View>
          }
          ListFooterComponent={
            hasMore ? <ActivityIndicator color="#d97706" style={{ marginVertical: 16 }} /> : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  searchRow: { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  search: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 15,
  },
  addBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#d97706',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 22, lineHeight: 24 },
  list: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  empty: { color: '#9ca3af', fontSize: 16 },
});
