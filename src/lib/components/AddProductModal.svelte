<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let username: string;

	const dispatch = createEventDispatcher();

	let name = '';
	let description = '';
	let rating = 5;
	let category = 'Other';
	let price = 0;
	let store = '';
	let country = '';
	let imageFile: File | null = null;
	let imagePreview = '';
	let error = '';
	let isLoading = false;

	const categories = ['Electronics', 'Clothing', 'Food', 'Home', 'Beauty', 'Sports', 'Other'];

	function handleImageChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		
		if (file) {
			imageFile = file;
			const reader = new FileReader();
			reader.onload = (e) => {
				imagePreview = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	async function handleSubmit() {
		error = '';
		
		// Validation
		if (!name || !description || !store || !country || !imageFile) {
			error = 'Please fill in all fields and upload an image';
			return;
		}

		if (price <= 0) {
			error = 'Price must be greater than 0';
			return;
		}

		isLoading = true;

		try {
			const formData = new FormData();
			formData.append('username', username);
			formData.append('name', name);
			formData.append('description', description);
			formData.append('rating', rating.toString());
			formData.append('category', category);
			formData.append('price', price.toString());
			formData.append('store', store);
			formData.append('country', country);
			formData.append('image', imageFile);

			const response = await fetch('/api/products', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				dispatch('productAdded');
			} else {
				const data = await response.json();
				error = data.error || 'Failed to add product';
			}
		} catch (e) {
			error = 'Network error. Please try again.';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
	<div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
		<!-- Header -->
		<div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-center">
			<h2 class="text-2xl font-bold text-white">Add New Product</h2>
		</div>

		<!-- Form -->
		<form on:submit|preventDefault={handleSubmit} class="p-6 space-y-4">
			<!-- Image Upload -->
			<div class="form-group">
				<label for="image" class="form-label">Product Image</label>
				<input
					id="image"
					type="file"
					accept="image/*"
					on:change={handleImageChange}
					class="form-input"
					disabled={isLoading}
				/>
				{#if imagePreview}
					<img src={imagePreview} alt="Preview" class="mt-2 w-full h-48 object-cover rounded-lg" />
				{/if}
			</div>

			<!-- Name -->
			<div class="form-group">
				<label for="name" class="form-label">Product Name</label>
				<input
					id="name"
					type="text"
					bind:value={name}
					placeholder="Enter product name"
					class="form-input"
					disabled={isLoading}
				/>
			</div>

			<!-- Description -->
			<div class="form-group">
				<label for="description" class="form-label">Description</label>
				<textarea
					id="description"
					bind:value={description}
					placeholder="Enter product description"
					rows="3"
					class="form-input"
					disabled={isLoading}
				/>
			</div>

			<!-- Category and Rating -->
			<div class="grid grid-cols-2 gap-4">
				<div class="form-group">
					<label for="category" class="form-label">Category</label>
					<select id="category" bind:value={category} class="form-input" disabled={isLoading}>
						{#each categories as cat}
							<option value={cat}>{cat}</option>
						{/each}
					</select>
				</div>

				<div class="form-group">
					<label for="rating" class="form-label">Rating (1-10)</label>
					<input
						id="rating"
						type="number"
						min="1"
						max="10"
						bind:value={rating}
						class="form-input"
						disabled={isLoading}
					/>
				</div>
			</div>

			<!-- Price, Store, and Country -->
			<div class="grid grid-cols-3 gap-4">
				<div class="form-group">
					<label for="price" class="form-label">Price ($)</label>
					<input
						id="price"
						type="number"
						step="0.01"
						min="0"
						bind:value={price}
						placeholder="0.00"
						class="form-input"
						disabled={isLoading}
					/>
				</div>

				<div class="form-group">
					<label for="store" class="form-label">Store</label>
					<input
						id="store"
						type="text"
						bind:value={store}
						placeholder="Enter store name"
						class="form-input"
						disabled={isLoading}
					/>
				</div>

				<div class="form-group">
					<label for="country" class="form-label">Country</label>
					<input
						id="country"
						type="text"
						bind:value={country}
						placeholder="Enter country"
						class="form-input"
						disabled={isLoading}
					/>
				</div>
			</div>

			<!-- Error Message -->
			{#if error}
				<div class="alert alert-error">
					<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
					</svg>
					<span>{error}</span>
				</div>
			{/if}

			<!-- Buttons -->
			<div class="flex gap-4 pt-4">
				<button
					type="button"
					on:click={() => dispatch('close')}
					class="btn btn-secondary flex-1"
					disabled={isLoading}
				>
					Cancel
				</button>
				<button
					type="submit"
					class="btn btn-primary flex-1"
					disabled={isLoading}
				>
					{#if isLoading}
						<svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
						</svg>
						Adding...
					{:else}
						Add Product
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>
