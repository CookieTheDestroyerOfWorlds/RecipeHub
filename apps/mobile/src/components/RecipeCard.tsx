import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import type { RecipeSummary } from '@recipehub/shared';
import { formatDuration } from '@recipehub/shared';

interface RecipeCardProps {
  recipe: RecipeSummary;
  onPress: () => void;
}

export function RecipeCard({ recipe, onPress }: RecipeCardProps) {
  const totalTime = (recipe.prepTimeMins ?? 0) + (recipe.cookTimeMins ?? 0);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {recipe.imageUrl ? (
        <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={styles.imagePlaceholderText}>🍽️</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          by {recipe.author.displayName ?? recipe.author.username}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.badge}>{recipe.difficulty}</Text>
          {recipe.cuisine && <Text style={styles.badge}>{recipe.cuisine}</Text>}
          {totalTime > 0 && <Text style={styles.metaText}>⏱ {formatDuration(totalTime)}</Text>}
          <Text style={styles.metaText}>❤️ {recipe.favoriteCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  image: { width: '100%', height: 160, backgroundColor: '#f3f4f6' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  imagePlaceholderText: { fontSize: 48 },
  body: { padding: 12 },
  title: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  author: { fontSize: 12, color: '#9ca3af', marginBottom: 8 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
    fontSize: 11,
    fontWeight: '500',
  },
  metaText: { fontSize: 12, color: '#6b7280' },
});
