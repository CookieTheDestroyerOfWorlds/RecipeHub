'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { createRecipeSchema, CUISINES, DIFFICULTIES, type CreateRecipeInput } from '@recipehub/shared';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from './ImageUpload';

interface RecipeFormProps {
  initialValues?: Partial<CreateRecipeInput>;
  recipeId?: string;
  onSuccess?: (slug: string) => void;
}

const defaultIngredient = { amount: '', unit: '', name: '' };
const defaultStep = { order: 1, instruction: '' };

export function RecipeForm({ initialValues, recipeId, onSuccess }: RecipeFormProps) {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateRecipeInput>({
    resolver: zodResolver(createRecipeSchema),
    defaultValues: {
      difficulty: 'medium',
      ingredients: [defaultIngredient],
      steps: [defaultStep],
      tags: [],
      isPublished: true,
      ...initialValues,
    },
  });

  const { fields: ingredientFields, append: addIngredient, remove: removeIngredient } = useFieldArray({ control, name: 'ingredients' });
  const { fields: stepFields, append: addStep, remove: removeStep } = useFieldArray({ control, name: 'steps' });

  const imageUrl = watch('imageUrl');

  const onSubmit = async (data: CreateRecipeInput) => {
    const url = recipeId ? `/api/recipes/${recipeId}` : '/api/recipes';
    const method = recipeId ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) {
      alert(json.error?.message ?? 'Failed to save recipe');
      return;
    }

    const slug = json.data?.recipe?.slug ?? '';
    if (onSuccess) {
      onSuccess(slug);
    } else {
      router.push(`/recipes/${slug}`);
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic info */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-lg">Basic Info</h2>

        <div>
          <label className="label">Title *</label>
          <input className={`input ${errors.title ? 'border-red-500' : ''}`} {...register('title')} />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input resize-none" rows={3} {...register('description')} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Difficulty *</label>
            <select className="input" {...register('difficulty')}>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Cuisine</label>
            <select className="input" {...register('cuisine')}>
              <option value="">Select cuisine</option>
              {CUISINES.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
          <div>
            <label className="label">Servings</label>
            <input className="input" type="number" min={1} {...register('servings', { valueAsNumber: true })} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Prep time (mins)</label>
            <input className="input" type="number" min={0} {...register('prepTimeMins', { valueAsNumber: true })} />
          </div>
          <div>
            <label className="label">Cook time (mins)</label>
            <input className="input" type="number" min={0} {...register('cookTimeMins', { valueAsNumber: true })} />
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="card p-6 space-y-2">
        <h2 className="font-semibold text-lg">Recipe Image</h2>
        <ImageUpload value={imageUrl ?? ''} onChange={(url) => setValue('imageUrl', url)} />
      </div>

      {/* Ingredients */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Ingredients *</h2>
          <Button type="button" variant="secondary" size="sm" onClick={() => addIngredient(defaultIngredient)}>
            + Add
          </Button>
        </div>
        {errors.ingredients?.root?.message && (
          <p className="text-sm text-red-600">{errors.ingredients.root.message}</p>
        )}
        <div className="space-y-3">
          {ingredientFields.map((field, i) => (
            <div key={field.id} className="flex gap-2 items-start">
              <input placeholder="Amount" {...register(`ingredients.${i}.amount`)} className="input w-20" />
              <input placeholder="Unit" {...register(`ingredients.${i}.unit`)} className="input w-24" />
              <input placeholder="Ingredient name" {...register(`ingredients.${i}.name`)} className="input flex-1" />
              <button type="button" onClick={() => removeIngredient(i)} className="mt-2 text-red-500 hover:text-red-700 text-lg leading-none">
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Steps *</h2>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => addStep({ order: stepFields.length + 1, instruction: '' })}
          >
            + Add
          </Button>
        </div>
        <div className="space-y-3">
          {stepFields.map((field, i) => (
            <div key={field.id} className="flex gap-3 items-start">
              <span className="mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-sm font-bold">
                {i + 1}
              </span>
              <input type="hidden" {...register(`steps.${i}.order`, { valueAsNumber: true })} value={i + 1} />
              <textarea
                placeholder={`Step ${i + 1} instructions…`}
                {...register(`steps.${i}.instruction`)}
                rows={2}
                className="input flex-1 resize-y"
              />
              <button type="button" onClick={() => removeStep(i)} className="mt-2 text-red-500 hover:text-red-700 text-lg leading-none">
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="card p-6 space-y-2">
        <h2 className="font-semibold text-lg">Tags</h2>
        <input
          className="input"
          placeholder="Comma-separated tags (e.g. vegan, quick, healthy)"
          onChange={(e) => {
            const tags = e.target.value
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean);
            setValue('tags', tags);
          }}
          defaultValue={initialValues?.tags?.join(', ') ?? ''}
        />
      </div>

      <div className="flex items-center justify-end gap-4">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {recipeId ? 'Save Changes' : 'Publish Recipe'}
        </Button>
      </div>
    </form>
  );
}
