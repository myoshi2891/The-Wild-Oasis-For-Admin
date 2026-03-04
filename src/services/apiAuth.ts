import supabase, { supabaseUrl } from "./supabase";
import type {
	SignupFormData,
	LoginFormData,
	UpdateUserData,
} from "../types/domain";

/**
 * Create a new user account and attach `fullName` and an empty `avatar` to the user's metadata.
 *
 * @param fullName - The user's full display name
 * @param email - The user's email address used for authentication
 * @param password - The user's password
 * @returns The authentication signup response data containing created user and session information
 */
export async function signup({ fullName, email, password }: SignupFormData) {
	const { data, error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: {
				fullName,
				avatar: "",
			},
		},
	});
	if (error) throw new Error(error.message);

	return data;
}

/**
 * Authenticate a user with the provided email and password.
 *
 * @returns The authentication data returned by the provider, including session and user information.
 */
export async function login({ email, password }: LoginFormData) {
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) throw new Error(error.message);
	return data;
}

/**
 * Retrieves the currently authenticated user, or null if no active session exists.
 *
 * @returns The authenticated user object when a session exists, or `null` when there is no active session.
 * @throws Error when retrieving the session or user from the auth service fails (error message from the provider).
 */
export async function getCurrentUser() {
	const { data: session, error: sessionError } = await supabase.auth.getSession();
	if (sessionError) throw new Error(sessionError.message);
	if (!session.session) return null;
	const { data, error } = await supabase.auth.getUser();

	if (error) throw new Error(error.message);
	return data?.user;
}

/**
 * Signs out the currently authenticated user.
 *
 * @throws An `Error` with the provider's message if the sign-out operation fails.
 */
export async function logout(): Promise<void> {
	const { error } = await supabase.auth.signOut();
	if (error) throw new Error(error.message);
}

/**
 * Update the current authenticated user's password and profile data, and optionally upload and set an avatar image.
 *
 * @param password - New password to set for the user; omitted to leave password unchanged
 * @param fullName - New display name to store in the user's profile data; omitted to leave unchanged
 * @param avatar - Binary file to upload as the user's avatar; if provided, the file is uploaded to the "avatars" storage bucket and the user's avatar URL is updated
 * @returns The result of the authentication update containing the updated user data
 * @throws Error when no update data is provided and no `avatar` is present
 * @throws Error when an authentication update fails
 * @throws Error when the user is not authenticated but an avatar upload requires a user id
 * @throws Error when storing the avatar file fails
 * @throws Error when updating the user's avatar URL fails (uploaded avatar will be removed if cleanup succeeds)
 */
export async function updateCurrentUser({
	password,
	fullName,
	avatar,
}: UpdateUserData) {
	// Build update payload: conditionally set password and nest fullName under data
	const updateData: Record<string, unknown> = {};
	if (password) updateData.password = password;
	if (fullName)
		updateData.data = {
			...((updateData.data as object) ?? {}),
			fullName,
		};

	// If there's auth data to update, call updateUser
	let data;
	if (Object.keys(updateData).length > 0) {
		const { data: authData, error } = await supabase.auth.updateUser(updateData);
		if (error) throw new Error(error.message);
		data = authData;
	}

	if (!avatar) {
		if (!data) throw new Error("No update data provided");
		return data;
	}

	let fileUserId: string;
	const userId = data?.user?.id;
	if (userId) {
		fileUserId = userId;
	} else {
		// Need current user for file naming
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) throw new Error("User not authenticated");
		fileUserId = user.id;
	}
	const fileName = `avatar-${fileUserId}-${crypto.randomUUID()}`;

	const { error: storageError } = await supabase.storage
		.from("avatars")
		.upload(fileName, avatar);

	if (storageError) throw new Error(storageError.message);

	try {
		const { data: updatedUser, error: error2 } = await supabase.auth.updateUser(
			{
				data: {
					avatar: `${supabaseUrl}/storage/v1/object/public/avatars/${fileName}`,
				},
			}
		);
		if (error2) throw error2;
		return updatedUser;
	} catch (err) {
		// Clean up uploaded avatar on failure
		const { error: removeError } = await supabase.storage
			.from("avatars")
			.remove([fileName]);
		if (removeError) console.warn("Failed to clean up avatar:", removeError);
		throw err instanceof Error ? err : new Error(String(err));
	}
}
