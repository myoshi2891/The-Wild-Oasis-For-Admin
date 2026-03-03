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
	const { data: session } = await supabase.auth.getSession();
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

	if (Object.keys(updateData).length === 0)
		throw new Error("No update data provided");

	const { data, error } = await supabase.auth.updateUser(updateData);

	if (error) throw new Error(error.message);
	if (!avatar) return data;

	const fileName = `avatar-${data.user.id}-${Math.random()}`;

	const { error: storageError } = await supabase.storage
		.from("avatars")
		.upload(fileName, avatar);

	if (storageError) throw new Error(storageError.message);

	const { data: updatedUser, error: error2 } = await supabase.auth.updateUser(
		{
			data: {
				avatar: `${supabaseUrl}/storage/v1/object/public/avatars/${fileName}`,
			},
		}
	);
	if (error2) throw new Error(error2.message);
	return updatedUser;
}
