import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { username, password } = await request.json();

		// Validation
		if (!username || !password) {
			return json({ error: 'Username and password are required' }, { status: 400 });
		}

		if (username.length < 3) {
			return json({ error: 'Username must be at least 3 characters' }, { status: 400 });
		}

		if (password.length < 6) {
			return json({ error: 'Password must be at least 6 characters' }, { status: 400 });
		}

		// Ensure data directory exists
		const dataDir = join(process.cwd(), 'data');
		if (!existsSync(dataDir)) {
			mkdirSync(dataDir, { recursive: true });
		}

		const usersPath = join(dataDir, 'users.json');
		let users: Array<{ username: string; password: string }> = [];

		// Read existing users
		try {
			if (existsSync(usersPath)) {
				const fileContent = readFileSync(usersPath, 'utf-8');
				users = JSON.parse(fileContent);
			}
		} catch (error) {
			// If file doesn't exist or is invalid, start with empty array
			users = [];
		}

		// Check if user already exists
		const existingUser = users.find((u) => u.username === username);
		if (existingUser) {
			return json({ error: 'Username already exists' }, { status: 409 });
		}

		// Add new user
		users.push({ username, password });

		// Save to file
		writeFileSync(usersPath, JSON.stringify(users, null, 2));

		return json({ message: 'Registration successful' });
	} catch (error) {
		return json({ error: 'Invalid request' }, { status: 400 });
	}
};
