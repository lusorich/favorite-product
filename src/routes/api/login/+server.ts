import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFileSync } from 'fs';
import { join } from 'path';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { username, password } = await request.json();

		// Read users from JSON file
		const usersPath = join(process.cwd(), 'data', 'users.json');
		let users: Array<{ username: string; password: string }> = [];

		try {
			const fileContent = readFileSync(usersPath, 'utf-8');
			users = JSON.parse(fileContent);
		} catch (error) {
			return json({ error: 'Unable to read user data' }, { status: 500 });
		}

		// Find user
		const user = users.find(
			(u) => u.username === username && u.password === password
		);

		if (user) {
			return json({ message: 'Login successful', username: user.username });
		} else {
			return json({ error: 'Invalid username or password' }, { status: 401 });
		}
	} catch (error) {
		return json({ error: 'Invalid request' }, { status: 400 });
	}
};
