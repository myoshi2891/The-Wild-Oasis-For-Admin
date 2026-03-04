import supabase, { supabaseUrl } from "./supabase";
import type { Cabin } from "../types/domain";

/**
 * Fetches all cabin records from the database.
 *
 * @returns An array of `Cabin` objects retrieved from the "cabins" table.
 * @throws Error when the cabins cannot be loaded from the database.
 */
export async function getCabins(): Promise<Cabin[]> {
	const { data, error } = await supabase.from("cabins").select("*");

	if (error) {
		console.error(error);
		throw new Error("Cabins could not be loaded");
	}

	return data;
}

/**
 * API-level cabin data for create/edit operations.
 * Note: image is narrowed to File | string (not FileList).
 * CreateCabinFormData.image may be File | FileList | string from the form;
 * the form's onSubmit extracts FileList[0] before passing to this interface.
 */
export interface CreateEditCabinData {
	name: string;
	maxCapacity: number;
	regularPrice: number;
	discount: number;
	description: string;
	image: File | string;
}

/**
 * Creates a new cabin or updates an existing cabin record and ensures the cabin image is stored.
 *
 * @param newCabin - Cabin data for create or update. `image` may be a File to upload or a supabase public URL string to reuse.
 * @param id - Optional cabin ID; if provided the function updates that cabin, otherwise it creates a new one.
 * @returns The created or updated `Cabin` record.
 * @throws Error when the database write fails, or when image upload to storage fails (on create, a failed upload triggers a rollback of the new record).
 */
export async function createEditCabin(
	newCabin: CreateEditCabinData,
	id?: number
): Promise<Cabin> {
	const hasImagePath =
		typeof newCabin.image === "string" &&
		newCabin.image.startsWith(supabaseUrl);

	const imageName =
		typeof newCabin.image === "string"
			? ""
			: `${crypto.randomUUID()}-${newCabin.image.name}`.replace(/\//g, "");

	const imagePath = hasImagePath
		? (newCabin.image as string)
		: `${supabaseUrl}/storage/v1/object/public/cabin-images/${imageName}`;

	const query = supabase.from("cabins");
	const payload = { ...newCabin, image: imagePath } as Record<
		string,
		unknown
	>;

	const builder = id
		? // eslint-disable-next-line @typescript-eslint/no-explicit-any
		  query.update(payload as any).eq("id", id)
		: // eslint-disable-next-line @typescript-eslint/no-explicit-any
		  query.insert([payload as any]);

	const { data, error } = await builder.select().single();

	if (error) {
		console.error(error);
		throw new Error(
			id ? "Cabin could not be updated." : "Cabin could not be created."
		);
	}

	if (hasImagePath) return data as Cabin;

	const { error: storageError } = await supabase.storage
		.from("cabin-images")
		.upload(imageName, newCabin.image as File);

	if (storageError) {
		// Only rollback (delete) for create flow — don't delete existing cabins on update
		if (!id) {
			await supabase.from("cabins").delete().eq("id", (data as Cabin).id);
		}
		console.error(storageError);
		throw new Error(
			"Cabin image could not be uploaded" +
				(!id ? " and the cabin was not created" : "") +
				"..."
		);
	}
	return data as Cabin;
}

/**
 * Deletes the cabin record with the given id.
 *
 * @param id - The numeric identifier of the cabin to remove
 * @returns `null` on successful deletion
 * @throws Error if the cabin could not be deleted
 */
export async function deleteCabin(id: number): Promise<null> {
	const { data, error } = await supabase
		.from("cabins")
		.delete()
		.eq("id", id);

	if (error) {
		console.error(error);
		throw new Error("Cabin could not be deleted.");
	}
	return data;
}
