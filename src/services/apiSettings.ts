import supabase from "./supabase";
import type { Settings, SettingsUpdate } from "../types/domain";

/**
 * Load the single settings row from the database.
 *
 * @returns The retrieved `Settings` object.
 * @throws Error if the settings row cannot be loaded.
 */
export async function getSettings(): Promise<Settings> {
	const { data, error } = await supabase
		.from("settings")
		.select("*")
		.single();

	if (error) {
		console.error(error);
		throw new Error("Settings could not be loaded");
	}
	return data;
}

/**
 * Update the single settings row in the database.
 *
 * @param newSetting - An object with the setting fields to update.
 * @returns The updated `Settings` object.
 * @throws Error if the settings row cannot be updated.
 */
export async function updateSetting(
	newSetting: SettingsUpdate
): Promise<Settings> {
	const { data, error } = await supabase
		.from("settings")
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		.update(newSetting as never)
		.select("*")
		// There is only ONE row of settings, and it has the ID=1, and so this is the updated one
		.eq("id", 1)
		.single();

	if (error) {
		console.error(error);
		throw new Error("Settings could not be updated");
	}
	return data;
}
