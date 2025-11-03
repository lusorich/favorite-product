import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const productsPath = join(process.cwd(), 'data', 'products.json');

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { username, productId } = await request.json();

		if (!username || !productId) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		if (!existsSync(productsPath)) {
			return json({ error: 'No products found' }, { status: 404 });
		}

		const fileContent = readFileSync(productsPath, 'utf-8');
		const allProducts = JSON.parse(fileContent);

		if (!allProducts[username]) {
			return json({ error: 'User has no products' }, { status: 404 });
		}

		const product = allProducts[username].find((p: any) => p.id === productId);
		if (!product) {
			return json({ error: 'Product not found' }, { status: 404 });
		}

		product.isFavorite = !product.isFavorite;
		writeFileSync(productsPath, JSON.stringify(allProducts, null, 2));

		return json({ message: 'Favorite toggled successfully', isFavorite: product.isFavorite });
	} catch (error) {
		console.error('Error toggling favorite:', error);
		return json({ error: 'Failed to toggle favorite' }, { status: 500 });
	}
};
