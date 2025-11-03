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
	};

	const dispatch = createEventDispatcher();
</script>

<div class="card hover:shadow-lg transition-shadow duration-200 cursor-pointer" on:click={() => dispatch('viewDetails')}>
	<!-- Image -->
	<div class="relative">
		<img
			src={product.image}
			alt={product.name}
			class="w-full h-48 object-cover rounded-t-lg"
		/>
		<!-- Favorite Button -->
		<button
			on:click|stopPropagation={() => dispatch('toggleFavorite')}
			class="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
		>
			<svg
				class="w-6 h-6 {product.isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}"
				fill={product.isFavorite ? 'currentColor' : 'none'}
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
			</svg>
		</button>
	</div>

	<!-- Content -->
	<div class="p-4">
		<!-- Name and Category -->
		<div class="mb-2">
			<h3 class="text-lg font-bold text-gray-900 truncate">{product.name}</h3>
			<span class="inline-block px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-100 rounded-full mt-1">
				{product.category}
			</span>
		</div>

		<!-- Description -->
		<p class="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

		<!-- Rating -->
		<div class="flex items-center mb-3">
			<div class="flex items-center">
				{#each Array(10) as _, i}
					<svg
						class="w-4 h-4 {i < product.rating ? 'text-yellow-400' : 'text-gray-300'}"
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
					</svg>
				{/each}
			</div>
			<span class="ml-2 text-sm font-semibold text-gray-700">{product.rating}/10</span>
		</div>

		<!-- Price and Store -->
		<div class="flex items-center justify-between mb-3">
			<span class="text-xl font-bold text-indigo-600">${product.price.toFixed(2)}</span>
			<span class="text-sm text-gray-500">{product.store}</span>
		</div>

		<!-- Country -->
		<div class="mb-3">
			<span class="text-xs text-gray-500">Country: {product.country}</span>
		</div>

		<!-- Delete Button -->
		<button
			on:click|stopPropagation={() => dispatch('delete')}
			class="w-full btn btn-outline text-red-600 border-red-600 hover:bg-red-50"
		>
			<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
			</svg>
			Delete
		</button>
	</div>
</div>
