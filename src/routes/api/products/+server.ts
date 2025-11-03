import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

interface Product {
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
}

interface UserProducts {
	[username: string]: Product[];
}

const productsPath = join(process.cwd(), 'data', 'products.json');
const uploadsDir = join(process.cwd(), 'static', 'uploads');

function ensureDirectories() {
	const dataDir = join(process.cwd(), 'data');
	if (!existsSync(dataDir)) {
		mkdirSync(dataDir, { recursive: true });
	}
	if (!existsSync(uploadsDir)) {
		mkdirSync(uploadsDir, { recursive: true });
	}
}

function readProducts(): UserProducts {
	ensureDirectories();
	try {
		if (existsSync(productsPath)) {
			const fileContent = readFileSync(productsPath, 'utf-8');
			return JSON.parse(fileContent);
		}
	} catch (error) {
		console.error('Error reading products:', error);
	}
	return {};
}

function writeProducts(products: UserProducts) {
	ensureDirectories();
	writeFileSync(productsPath, JSON.stringify(products, null, 2));
}

export const GET: RequestHandler = async ({ url }) => {
	const username = url.searchParams.get('username');
	
	if (!username) {
		return json({ error: 'Username required' }, { status: 400 });
	}

	const allProducts = readProducts();
	const userProducts = allProducts[username] || [];

	return json({ products: userProducts });
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const username = formData.get('username') as string;
		const name = formData.get('name') as string;
		const description = formData.get('description') as string || '';
		const rating = parseInt(formData.get('rating') as string) || 5;
		const category = formData.get('category') as string || 'Other';
		const price = parseFloat(formData.get('price') as string) || 0;
		const store = formData.get('store') as string || '';
		const country = formData.get('country') as string || '';
		const imageFile = formData.get('image') as File;

		// Only name and image are required
		if (!username || !name || !imageFile) {
			return json({ error: 'Username, product name, and image are required' }, { status: 400 });
		}

		// Save image
		const imageExt = imageFile.name.split('.').pop();
		const imageName = `${randomUUID()}.${imageExt}`;
		const imagePath = join(uploadsDir, imageName);
		
		const buffer = Buffer.from(await imageFile.arrayBuffer());
		writeFileSync(imagePath, buffer);

		// Create product
		const product: Product = {
			id: randomUUID(),
			name,
			description,
			rating,
			category,
			price,
			store,
			country,
			image: `/uploads/${imageName}`,
			isFavorite: false,
			createdAt: new Date().toISOString()
		};

		// Save to products file
		const allProducts = readProducts();
		if (!allProducts[username]) {
			allProducts[username] = [];
		}
		allProducts[username].push(product);
		writeProducts(allProducts);

		return json({ message: 'Product added successfully', product });
	} catch (error) {
		console.error('Error adding product:', error);
		return json({ error: 'Failed to add product' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ request }) => {
	try {
		const { username, productId } = await request.json();

		if (!username || !productId) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		const allProducts = readProducts();
		if (!allProducts[username]) {
			return json({ error: 'User has no products' }, { status: 404 });
		}

		allProducts[username] = allProducts[username].filter(p => p.id !== productId);
		writeProducts(allProducts);

		return json({ message: 'Product deleted successfully' });
	} catch (error) {
		console.error('Error deleting product:', error);
		return json({ error: 'Failed to delete product' }, { status: 500 });
	}
};
