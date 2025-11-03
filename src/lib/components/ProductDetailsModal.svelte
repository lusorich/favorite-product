<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let product: {
		id: string;
		name: string;
		description: string;
		rating: number;
		category: string;
		price: number;
		store: string;
		country: string;
		image: string;
		isFavorite: boolean;
		createdAt: string;
	};
	export let username: string;

	const dispatch = createEventDispatcher();

	let isEditing = false;
	let editedProduct = { ...product };
	let imageFile: File | null = null;
	let imagePreview = product.image;
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

	function toggleEdit() {
		if (isEditing) {
			// Cancel editing - reset to original values
			editedProduct = { ...product };
			imageFile = null;
			imagePreview = product.image;
			error = '';
		}
		isEditing = !isEditing;
	}

	async function handleSave() {
		error = '';

		// Validation
		if (!editedProduct.name || !editedProduct.description || !editedProduct.store || !editedProduct.country) {
			error = 'Please fill in all fields';
			return;
		}

		if (editedProduct.price <= 0) {
			error = 'Price must be greater than 0';
			return;
		}

		isLoading = true;

		try {
			const formData = new FormData();
			formData.append('username', username);
			formData.append('productId', product.id);
			formData.append('name', editedProduct.name);
			formData.append('description', editedProduct.description);
			formData.append('rating', editedProduct.rating.toString());
			formData.append('category', editedProduct.category);
			formData.append('price', editedProduct.price.toString());
			formData.append('store', editedProduct.store);
			formData.append('country', editedProduct.country);
			
			if (imageFile) {
				formData.append('image', imageFile);
			}

			const response = await fetch('/api/products/update', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				const data = await response.json();
				dispatch('productUpdated', data.product);
				isEditing = false;
			} else {
				const data = await response.json();
				error = data.error || 'Failed to update product';
			}
		} catch (e) {
			error = 'Network error. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { 
			year: 'numeric', 
			month: 'long', 
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" on:click={() => dispatch('close')}>
	<div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" on:click|stopPropagation>
		<!-- Header -->
		<div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex items-center justify-between">
			<h2 class="text-2xl font-bold text-white">
				{isEditing ? 'Edit Product' : 'Product Details'}
			</h2>
			<button
				on:click={() => dispatch('close')}
				class="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
				</svg>
			</button>
		</div>

		<!-- Content -->
		<div class="p-6">
			{#if isEditing}
				<!-- Edit Form -->
				<form on:submit|preventDefault={handleSave} class="space-y-4">
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
						<img src={imagePreview} alt="Preview" class="mt-2 w-full h-64 object-cover rounded-lg" />
					</div>

					<!-- Name -->
					<div class="form-group">
						<label for="name" class="form-label">Product Name</label>
						<input
							id="name"
							type="text"
							bind:value={editedProduct.name}
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
							bind:value={editedProduct.description}
							placeholder="Enter product description"
							rows="4"
							class="form-input"
							disabled={isLoading}
						/>
					</div>

					<!-- Category and Rating -->
					<div class="grid grid-cols-2 gap-4">
						<div class="form-group">
							<label for="category" class="form-label">Category</label>
							<select id="category" bind:value={editedProduct.category} class="form-input" disabled={isLoading}>
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
								bind:value={editedProduct.rating}
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
								bind:value={editedProduct.price}
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
								bind:value={editedProduct.store}
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
								bind:value={editedProduct.country}
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
							on:click={toggleEdit}
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
								Saving...
							{:else}
								Save Changes
							{/if}
						</button>
					</div>
				</form>
			{:else}
				<!-- View Mode -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<!-- Image -->
					<div>
						<img src={product.image} alt={product.name} class="w-full h-auto rounded-lg shadow-md" />
					</div>

					<!-- Details -->
					<div class="space-y-4">
						<!-- Name and Category -->
						<div>
							<h3 class="text-3xl font-bold text-gray-900 mb-2">{product.name}</h3>
							<span class="inline-block px-3 py-1 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-full">
								{product.category}
							</span>
							{#if product.isFavorite}
								<span class="inline-block px-3 py-1 text-sm font-semibold text-red-600 bg-red-100 rounded-full ml-2">
									<svg class="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
									</svg>
									Favorite
								</span>
							{/if}
						</div>

						<!-- Description -->
						<div>
							<h4 class="text-sm font-semibold text-gray-700 mb-1">Description</h4>
							<p class="text-gray-600">{product.description}</p>
						</div>

						<!-- Rating -->
						<div>
							<h4 class="text-sm font-semibold text-gray-700 mb-2">Rating</h4>
							<div class="flex items-center">
								<div class="flex items-center">
									{#each Array(10) as _, i}
										<svg
											class="w-5 h-5 {i < product.rating ? 'text-yellow-400' : 'text-gray-300'}"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
										</svg>
									{/each}
								</div>
								<span class="ml-3 text-lg font-semibold text-gray-700">{product.rating}/10</span>
							</div>
						</div>

						<!-- Price -->
						<div>
							<h4 class="text-sm font-semibold text-gray-700 mb-1">Price</h4>
							<p class="text-3xl font-bold text-indigo-600">${product.price.toFixed(2)}</p>
						</div>

						<!-- Store -->
						<div>
							<h4 class="text-sm font-semibold text-gray-700 mb-1">Store</h4>
							<p class="text-gray-600">{product.store}</p>
						</div>

						<!-- Country -->
						<div>
							<h4 class="text-sm font-semibold text-gray-700 mb-1">Country</h4>
							<p class="text-gray-600">{product.country}</p>
						</div>

						<!-- Created Date -->
						<div>
							<h4 class="text-sm font-semibold text-gray-700 mb-1">Added on</h4>
							<p class="text-gray-600">{formatDate(product.createdAt)}</p>
						</div>
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="flex gap-4 mt-6 pt-6 border-t border-gray-200">
					<button
						on:click={toggleEdit}
						class="btn btn-primary flex-1"
					>
						<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
						</svg>
						Edit Product
					</button>
					<button
						on:click={() => dispatch('close')}
						class="btn btn-secondary flex-1"
					>
						Close
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>
