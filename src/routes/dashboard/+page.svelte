<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import ProductCard from '$lib/components/ProductCard.svelte';
	import AddProductModal from '$lib/components/AddProductModal.svelte';
	
	interface Product {
		id: string;
		name: string;
		description: string;
		rating: number;
		category: string;
		price: number;
		store: string;
		image: string;
		isFavorite: boolean;
		createdAt: string;
	}

	let username = '';
	let products: Product[] = [];
	let filteredProducts: Product[] = [];
	let showAddModal = false;
	let searchQuery = '';
	let selectedCategory = 'all';
	let sortBy = 'newest';
	let showFavoritesOnly = false;
	let isLoading = true;

	const categories = ['all', 'Electronics', 'Clothing', 'Food', 'Home', 'Beauty', 'Sports', 'Other'];

	onMount(async () => {
		// Check if user is logged in
		username = localStorage.getItem('username') || '';
		if (!username) {
			goto('/');
			return;
		}

		await loadProducts();
	});

	async function loadProducts() {
		isLoading = true;
		try {
			const response = await fetch(`/api/products?username=${username}`);
			if (response.ok) {
				const data = await response.json();
				products = data.products || [];
				applyFilters();
			}
		} catch (error) {
			console.error('Failed to load products:', error);
		} finally {
			isLoading = false;
		}
	}

	function applyFilters() {
		let result = [...products];

		// Search filter
		if (searchQuery) {
			result = result.filter(p => 
				p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
				p.store.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		// Category filter
		if (selectedCategory !== 'all') {
			result = result.filter(p => p.category === selectedCategory);
		}

		// Favorites filter
		if (showFavoritesOnly) {
			result = result.filter(p => p.isFavorite);
		}

		// Sort
		switch (sortBy) {
			case 'newest':
				result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
				break;
			case 'oldest':
				result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
				break;
			case 'rating-high':
				result.sort((a, b) => b.rating - a.rating);
				break;
			case 'rating-low':
				result.sort((a, b) => a.rating - b.rating);
				break;
			case 'price-high':
				result.sort((a, b) => b.price - a.price);
				break;
			case 'price-low':
				result.sort((a, b) => a.price - b.price);
				break;
			case 'name':
				result.sort((a, b) => a.name.localeCompare(b.name));
				break;
		}

		filteredProducts = result;
	}

	function handleLogout() {
		localStorage.removeItem('username');
		goto('/');
	}

	function handleProductAdded() {
		showAddModal = false;
		loadProducts();
	}

	async function handleToggleFavorite(productId: string) {
		try {
			const response = await fetch('/api/products/favorite', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, productId })
			});

			if (response.ok) {
				await loadProducts();
			}
		} catch (error) {
			console.error('Failed to toggle favorite:', error);
		}
	}

	async function handleDeleteProduct(productId: string) {
		if (!confirm('Are you sure you want to delete this product?')) return;

		try {
			const response = await fetch('/api/products', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, productId })
			});

			if (response.ok) {
				await loadProducts();
			}
		} catch (error) {
			console.error('Failed to delete product:', error);
		}
	}

	$: {
		searchQuery;
		selectedCategory;
		sortBy;
		showFavoritesOnly;
		applyFilters();
	}
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-white shadow-sm border-b border-gray-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-2xl font-bold text-gray-900">My Products</h1>
					<p class="text-sm text-gray-600">Welcome back, {username}!</p>
				</div>
				<div class="flex items-center gap-4">
					<button
						on:click={() => showAddModal = true}
						class="btn btn-primary"
					>
						<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
						</svg>
						Add Product
					</button>
					<button
						on:click={handleLogout}
						class="btn btn-secondary"
					>
						Logout
					</button>
				</div>
			</div>
		</div>
	</header>

	<!-- Filters and Search -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
		<div class="bg-white rounded-lg shadow-sm p-6 mb-6">
			<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
				<!-- Search -->
				<div class="md:col-span-2">
					<label for="search" class="form-label">Search</label>
					<input
						id="search"
						type="text"
						bind:value={searchQuery}
						placeholder="Search products..."
						class="form-input"
					/>
				</div>

				<!-- Category Filter -->
				<div>
					<label for="category" class="form-label">Category</label>
					<select id="category" bind:value={selectedCategory} class="form-input">
						{#each categories as category}
							<option value={category}>{category === 'all' ? 'All Categories' : category}</option>
						{/each}
					</select>
				</div>

				<!-- Sort -->
				<div>
					<label for="sort" class="form-label">Sort By</label>
					<select id="sort" bind:value={sortBy} class="form-input">
						<option value="newest">Newest First</option>
						<option value="oldest">Oldest First</option>
						<option value="rating-high">Rating: High to Low</option>
						<option value="rating-low">Rating: Low to High</option>
						<option value="price-high">Price: High to Low</option>
						<option value="price-low">Price: Low to High</option>
						<option value="name">Name: A to Z</option>
					</select>
				</div>
			</div>

			<!-- Favorites Toggle -->
			<div class="mt-4">
				<label class="flex items-center cursor-pointer">
					<input
						type="checkbox"
						bind:checked={showFavoritesOnly}
						class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
					/>
					<span class="ml-2 text-sm font-medium text-gray-700">Show favorites only</span>
				</label>
			</div>
		</div>

		<!-- Products Grid -->
		{#if isLoading}
			<div class="flex items-center justify-center py-12">
				<svg class="animate-spin h-12 w-12 text-indigo-600" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
				</svg>
			</div>
		{:else if filteredProducts.length === 0}
			<div class="text-center py-12">
				<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
				</svg>
				<h3 class="mt-2 text-sm font-medium text-gray-900">No products found</h3>
				<p class="mt-1 text-sm text-gray-500">Get started by adding a new product.</p>
				<div class="mt-6">
					<button on:click={() => showAddModal = true} class="btn btn-primary">
						<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
						</svg>
						Add Product
					</button>
				</div>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{#each filteredProducts as product (product.id)}
					<ProductCard
						{product}
						on:toggleFavorite={() => handleToggleFavorite(product.id)}
						on:delete={() => handleDeleteProduct(product.id)}
					/>
				{/each}
			</div>
		{/if}
	</div>
</div>

<!-- Add Product Modal -->
{#if showAddModal}
	<AddProductModal
		{username}
		on:close={() => showAddModal = false}
		on:productAdded={handleProductAdded}
	/>
{/if}
