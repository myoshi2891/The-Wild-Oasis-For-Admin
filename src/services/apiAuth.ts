import supabase, { supabaseUrl } from "./supabase";
import type {
	SignupFormData,
	LoginFormData,
	UpdateUserData,
} from "../types/domain";

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

export async function login({ email, password }: LoginFormData) {
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) throw new Error(error.message);
	return data;
}

export async function getCurrentUser() {
	const { data: session, error: sessionError } = await supabase.auth.getSession();
	if (sessionError) throw new Error(sessionError.message);
	if (!session.session) return null;
	const { data, error } = await supabase.auth.getUser();

	if (error) throw new Error(error.message);
	return data?.user;
}

export async function logout(): Promise<void> {
	const { error } = await supabase.auth.signOut();
	if (error) throw new Error(error.message);
}

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
