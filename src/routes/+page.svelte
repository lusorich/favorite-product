<script lang="ts">
	import { onMount } from 'svelte';
	
	let isLogin = true;
	let username = '';
	let password = '';
	let confirmPassword = '';
	let error = '';
	let success = '';
	let isLoading = false;

	function toggleMode() {
		isLogin = !isLogin;
		error = '';
		success = '';
		username = '';
		password = '';
		confirmPassword = '';
	}

	async function handleSubmit() {
		error = '';
		success = '';
		isLoading = true;

		// Validation
		if (!username || !password) {
			error = 'Please fill in all fields';
			isLoading = false;
			return;
		}

		if (!isLogin && password !== confirmPassword) {
			error = 'Passwords do not match';
			isLoading = false;
			return;
		}

		try {
			const endpoint = isLogin ? '/api/login' : '/api/register';
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username, password })
			});

			const data = await response.json();

			if (response.ok) {
				success = data.message;
				if (isLogin) {
					// Redirect or handle successful login
					setTimeout(() => {
						alert('Login successful!');
					}, 1000);
				} else {
					// Switch to login mode after successful registration
					setTimeout(() => {
						toggleMode();
						success = 'Registration successful! Please login.';
					}, 1500);
				}
			} else {
				error = data.error || 'An error occurred';
			}
		} catch (e) {
			error = 'Network error. Please try again.';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
	<div class="w-full max-w-md">
		<!-- Card -->
		<div class="bg-white rounded-2xl shadow-2xl overflow-hidden">
			<!-- Header -->
			<div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center">
				<h1 class="text-3xl font-bold text-white mb-2">
					{isLogin ? 'Welcome Back' : 'Create Account'}
				</h1>
				<p class="text-indigo-100">
					{isLogin ? 'Sign in to continue' : 'Sign up to get started'}
				</p>
			</div>

			<!-- Form -->
			<div class="p-8">
				<form on:submit|preventDefault={handleSubmit} class="space-y-6">
					<!-- Username Input -->
					<div class="form-group">
						<label for="username" class="form-label">Username</label>
						<input
							id="username"
							type="text"
							bind:value={username}
							class="form-input"
							placeholder="Enter your username"
							disabled={isLoading}
						/>
					</div>

					<!-- Password Input -->
					<div class="form-group">
						<label for="password" class="form-label">Password</label>
						<input
							id="password"
							type="password"
							bind:value={password}
							class="form-input"
							placeholder="Enter your password"
							disabled={isLoading}
						/>
					</div>

					<!-- Confirm Password (Registration only) -->
					{#if !isLogin}
						<div class="form-group">
							<label for="confirmPassword" class="form-label">Confirm Password</label>
							<input
								id="confirmPassword"
								type="password"
								bind:value={confirmPassword}
								class="form-input"
								placeholder="Confirm your password"
								disabled={isLoading}
							/>
						</div>
					{/if}

					<!-- Error Message -->
					{#if error}
						<div class="alert alert-error">
							<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
							</svg>
							<span>{error}</span>
						</div>
					{/if}

					<!-- Success Message -->
					{#if success}
						<div class="alert alert-success">
							<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
							</svg>
							<span>{success}</span>
						</div>
					{/if}

					<!-- Submit Button -->
					<button
						type="submit"
						class="btn btn-primary w-full"
						disabled={isLoading}
					>
						{#if isLoading}
							<svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
							</svg>
							Processing...
						{:else}
							{isLogin ? 'Sign In' : 'Sign Up'}
						{/if}
					</button>
				</form>

				<!-- Toggle Mode -->
				<div class="mt-6 text-center">
					<p class="text-gray-600">
						{isLogin ? "Don't have an account?" : 'Already have an account?'}
						<button
							type="button"
							on:click={toggleMode}
							class="text-indigo-600 hover:text-indigo-700 font-semibold ml-1 transition-colors"
							disabled={isLoading}
						>
							{isLogin ? 'Sign Up' : 'Sign In'}
						</button>
					</p>
				</div>
			</div>
		</div>

		<!-- Footer -->
		<p class="text-center text-white text-sm mt-6 opacity-90">
			© 2024 Your App. All rights reserved.
		</p>
	</div>
</div>
