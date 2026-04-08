import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePickerLib from 'expo-image-picker';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { CreateRecipeInput } from '@recipehub/shared';

export default function NewRecipeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [imageUrl, setImageUrl] = useState('');
  const [ingredients, setIngredients] = useState([{ amount: '', unit: '', name: '' }]);
  const [steps, setSteps] = useState([{ order: 1, instruction: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  if (!user) {
    router.replace('/(auth)/login');
    return null;
  }

  const pickImage = async () => {
    const result = await ImagePickerLib.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset) return;

    setUploadingImage(true);
    const filename = asset.uri.split('/').pop() ?? 'image.jpg';
    const contentType = asset.mimeType ?? 'image/jpeg';

    const presignResult = await apiFetch<{ uploadUrl: string; publicUrl: string }>(
      '/api/uploads/presign',
      { method: 'POST', body: JSON.stringify({ filename, contentType }) }
    );

    if (presignResult.data) {
      const { uploadUrl, publicUrl } = presignResult.data;
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: await (await fetch(asset.uri)).blob(),
      });
      setImageUrl(publicUrl);
    }
    setUploadingImage(false);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    const validIngredients = ingredients.filter((i) => i.name.trim());
    if (validIngredients.length === 0) {
      Alert.alert('Error', 'At least one ingredient is required');
      return;
    }
    const validSteps = steps.filter((s) => s.instruction.trim());
    if (validSteps.length === 0) {
      Alert.alert('Error', 'At least one step is required');
      return;
    }

    setSubmitting(true);
    const body: CreateRecipeInput = {
      title,
      description: description || undefined,
      imageUrl: imageUrl || undefined,
      difficulty,
      ingredients: validIngredients,
      steps: validSteps.map((s, i) => ({ ...s, order: i + 1 })),
    };

    const result = await apiFetch<{ recipe: { slug: string } }>('/api/recipes', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    setSubmitting(false);

    if (result.error) {
      Alert.alert('Error', result.error.message);
      return;
    }
    Alert.alert('Success!', 'Recipe published.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <Text style={styles.label}>Title *</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="My amazing recipe" />

        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.multiline]} value={description} onChangeText={setDescription} placeholder="Describe your recipe…" multiline numberOfLines={3} />

        <Text style={styles.label}>Difficulty</Text>
        <View style={styles.radioRow}>
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.radio, difficulty === d && styles.radioActive]}
              onPress={() => setDifficulty(d)}
            >
              <Text style={[styles.radioText, difficulty === d && styles.radioTextActive]}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Image */}
        <TouchableOpacity style={styles.imageBtn} onPress={pickImage} disabled={uploadingImage}>
          {uploadingImage ? (
            <ActivityIndicator color="#d97706" />
          ) : imageUrl ? (
            <Text style={styles.imageBtnText}>✅ Image uploaded</Text>
          ) : (
            <Text style={styles.imageBtnText}>📷 Pick Image</Text>
          )}
        </TouchableOpacity>

        {/* Ingredients */}
        <Text style={styles.sectionLabel}>Ingredients *</Text>
        {ingredients.map((ing, i) => (
          <View key={i} style={styles.ingredientRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Amount"
              value={ing.amount}
              onChangeText={(v) =>
                setIngredients((prev) => prev.map((x, j) => (j === i ? { ...x, amount: v } : x)))
              }
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Name"
              value={ing.name}
              onChangeText={(v) =>
                setIngredients((prev) => prev.map((x, j) => (j === i ? { ...x, name: v } : x)))
              }
            />
          </View>
        ))}
        <TouchableOpacity
          style={styles.addRowBtn}
          onPress={() => setIngredients((prev) => [...prev, { amount: '', unit: '', name: '' }])}
        >
          <Text style={styles.addRowBtnText}>+ Add Ingredient</Text>
        </TouchableOpacity>

        {/* Steps */}
        <Text style={styles.sectionLabel}>Instructions *</Text>
        {steps.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepNumBadge}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            <TextInput
              style={[styles.input, styles.multiline, { flex: 1 }]}
              placeholder={`Step ${i + 1}…`}
              value={step.instruction}
              onChangeText={(v) =>
                setSteps((prev) => prev.map((s, j) => (j === i ? { ...s, instruction: v } : s)))
              }
              multiline
            />
          </View>
        ))}
        <TouchableOpacity
          style={styles.addRowBtn}
          onPress={() => setSteps((prev) => [...prev, { order: prev.length + 1, instruction: '' }])}
        >
          <Text style={styles.addRowBtnText}>+ Add Step</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitBtnText}>{submitting ? 'Publishing…' : 'Publish Recipe'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  form: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 4, marginTop: 12 },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 20, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  radioRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  radio: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  radioActive: { borderColor: '#d97706', backgroundColor: '#fef3c7' },
  radioText: { fontSize: 14, color: '#6b7280' },
  radioTextActive: { color: '#92400e', fontWeight: '600' },
  imageBtn: {
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginVertical: 8,
  },
  imageBtnText: { fontSize: 15, color: '#6b7280' },
  ingredientRow: { flexDirection: 'row', gap: 8 },
  stepRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  stepNumBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  stepNumText: { fontSize: 12, fontWeight: '700', color: '#92400e' },
  addRowBtn: { paddingVertical: 8, alignItems: 'center' },
  addRowBtnText: { color: '#d97706', fontSize: 14, fontWeight: '600' },
  submitBtn: { backgroundColor: '#d97706', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
