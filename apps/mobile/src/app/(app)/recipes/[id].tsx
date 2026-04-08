import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatRelativeTime, formatDuration } from '@recipehub/shared';
import type { RecipeDetail, CommentWithAuthor } from '@recipehub/shared';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [commentBody, setCommentBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch<{ recipe: RecipeDetail }>(`/api/recipes/${id}`),
      apiFetch<{ items: CommentWithAuthor[] }>(`/api/recipes/${id}/comments`),
    ]).then(([recipeRes, commentRes]) => {
      if (recipeRes.data) {
        setRecipe(recipeRes.data.recipe);
        setFavorited(recipeRes.data.recipe.isFavorited ?? false);
        setFavCount(recipeRes.data.recipe.favoriteCount);
      }
      if (commentRes.data) setComments(commentRes.data.items);
      setLoading(false);
    });
  }, [id]);

  const toggleFavorite = async () => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }
    const result = await apiFetch<{ favorited: boolean; count: number }>(
      `/api/recipes/${id}/favorite`,
      { method: 'POST' }
    );
    if (result.data) {
      setFavorited(result.data.favorited);
      setFavCount(result.data.count);
    }
  };

  const postComment = async () => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }
    if (!commentBody.trim()) return;
    setCommenting(true);
    const result = await apiFetch<{ comment: CommentWithAuthor }>(
      `/api/recipes/${id}/comments`,
      { method: 'POST', body: JSON.stringify({ body: commentBody }) }
    );
    setCommenting(false);
    if (result.data) {
      setComments((prev) => [result.data!.comment, ...prev]);
      setCommentBody('');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d97706" />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.center}>
        <Text>Recipe not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {recipe.imageUrl && (
        <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
      )}

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{recipe.title}</Text>
          <TouchableOpacity onPress={toggleFavorite} style={styles.favBtn}>
            <Text style={styles.favBtnText}>{favorited ? '❤️' : '🤍'} {favCount}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.author}>
          by {recipe.author.displayName ?? recipe.author.username}
        </Text>

        {recipe.description && (
          <Text style={styles.description}>{recipe.description}</Text>
        )}

        {/* Meta */}
        <View style={styles.metaRow}>
          {recipe.prepTimeMins != null && (
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Prep</Text>
              <Text style={styles.metaValue}>{formatDuration(recipe.prepTimeMins)}</Text>
            </View>
          )}
          {recipe.cookTimeMins != null && (
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Cook</Text>
              <Text style={styles.metaValue}>{formatDuration(recipe.cookTimeMins)}</Text>
            </View>
          )}
          {recipe.servings != null && (
            <View style={styles.metaCard}>
              <Text style={styles.metaLabel}>Serves</Text>
              <Text style={styles.metaValue}>{recipe.servings}</Text>
            </View>
          )}
        </View>

        {/* Ingredients */}
        <Text style={styles.sectionTitle}>Ingredients</Text>
        {recipe.ingredients.map((ing, i) => (
          <Text key={i} style={styles.ingredient}>
            • {ing.amount} {ing.unit} {ing.name}
          </Text>
        ))}

        {/* Steps */}
        <Text style={styles.sectionTitle}>Instructions</Text>
        {recipe.steps.sort((a, b) => a.order - b.order).map((step) => (
          <View key={step.order} style={styles.step}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{step.order}</Text>
            </View>
            <Text style={styles.stepText}>{step.instruction}</Text>
          </View>
        ))}

        {/* Comments */}
        <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>
        <View style={styles.commentInputRow}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment…"
            value={commentBody}
            onChangeText={setCommentBody}
            multiline
          />
          <TouchableOpacity
            style={[styles.commentBtn, (!commentBody.trim() || commenting) && styles.commentBtnDisabled]}
            onPress={postComment}
            disabled={!commentBody.trim() || commenting}
          >
            <Text style={styles.commentBtnText}>{commenting ? '…' : '→'}</Text>
          </TouchableOpacity>
        </View>

        {comments.map((c) => (
          <View key={c.id} style={styles.comment}>
            <Text style={styles.commentAuthor}>
              {c.author?.displayName ?? c.author?.username ?? '[deleted]'}
              {'  '}
              <Text style={styles.commentTime}>{formatRelativeTime(c.createdAt)}</Text>
            </Text>
            <Text style={styles.commentBody}>{c.body}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: 240 },
  content: { padding: 16 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  title: { flex: 1, fontSize: 22, fontWeight: '700', color: '#111827' },
  favBtn: { backgroundColor: '#fef3c7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  favBtnText: { fontSize: 14, fontWeight: '500' },
  author: { fontSize: 13, color: '#9ca3af', marginTop: 4, marginBottom: 12 },
  description: { fontSize: 15, color: '#4b5563', lineHeight: 22, marginBottom: 16 },
  metaRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  metaCard: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 8, padding: 10, alignItems: 'center' },
  metaLabel: { fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 },
  metaValue: { fontSize: 16, fontWeight: '600', color: '#111827', marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 20, marginBottom: 10 },
  ingredient: { fontSize: 14, color: '#374151', paddingVertical: 4 },
  step: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepNumText: { fontSize: 13, fontWeight: '700', color: '#92400e' },
  stepText: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 21, paddingTop: 4 },
  commentInputRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  commentInput: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 14, minHeight: 48 },
  commentBtn: { width: 48, height: 48, backgroundColor: '#d97706', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  commentBtnDisabled: { opacity: 0.4 },
  commentBtnText: { color: '#fff', fontSize: 20, fontWeight: '600' },
  comment: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  commentAuthor: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 4 },
  commentTime: { fontSize: 11, color: '#9ca3af', fontWeight: '400' },
  commentBody: { fontSize: 14, color: '#4b5563' },
});
