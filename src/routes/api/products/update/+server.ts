import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

const productsPath = join(process.cwd(), 'data', 'products.json');
const uploadsDir = join(process.cwd(), 'static', 'uploads');

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const username = formData.get('username') as string;
		const productId = formData.get('productId') as string;
		const name = formData.get('name') as string;
		const description = formData.get('description') as string || '';
		const rating = parseInt(formData.get('rating') as string) || 5;
		const category = formData.get('category') as string || 'Other';
		const price = parseFloat(formData.get('price') as string) || 0;
		const store = formData.get('store') as string || '';
		const country = formData.get('country') as string || '';
		const imageFile = formData.get('image') as File | null;

		// Only name is required
		if (!username || !productId || !name) {
			return json({ error: 'Username, product ID, and name are required' }, { status: 400 });
		}

		if (!existsSync(productsPath)) {
			return json({ error: 'No products found' }, { status: 404 });
		}

		const fileContent = readFileSync(productsPath, 'utf-8');
		const allProducts = JSON.parse(fileContent);

		if (!allProducts[username]) {
			return json({ error: 'User has no products' }, { status: 404 });
		}

		const productIndex = allProducts[username].findIndex((p: any) => p.id === productId);
		if (productIndex === -1) {
			return json({ error: 'Product not found' }, { status: 404 });
		}

		const product = allProducts[username][productIndex];

		// Update product fields
		product.name = name;
		product.description = description;
		product.rating = rating;
		product.category = category;
		product.price = price;
		product.store = store;
		product.country = country;

		// Update image if new one provided
		if (imageFile && imageFile.size > 0) {
			const imageExt = imageFile.name.split('.').pop();
			const imageName = `${randomUUID()}.${imageExt}`;
			const imagePath = join(uploadsDir, imageName);
			
			const buffer = Buffer.from(await imageFile.arrayBuffer());
			writeFileSync(imagePath, buffer);
			
			product.image = `/uploads/${imageName}`;
		}

		allProducts[username][productIndex] = product;
		writeFileSync(productsPath, JSON.stringify(allProducts, null, 2));

		return json({ message: 'Product updated successfully', product });
	} catch (error) {
		console.error('Error updating product:', error);
		return json({ error: 'Failed to update product' }, { status: 500 });
	}
};
