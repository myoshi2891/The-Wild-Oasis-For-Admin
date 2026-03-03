import supabase, { supabaseUrl } from "./supabase";
import type { Cabin } from "../types/domain";

export async function getCabins(): Promise<Cabin[]> {
	const { data, error } = await supabase.from("cabins").select("*");

	if (error) {
		console.error(error);
		throw new Error("Cabins could not be loaded");
	}

	return data;
}

export interface CreateEditCabinData {
	name: string;
	maxCapacity: number;
	regularPrice: number;
	discount: number;
	description: string;
	image: File | string;
}

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
			: `${Math.random()}-${newCabin.image.name}`.replaceAll("/", "");

	const imagePath = hasImagePath
		? (newCabin.image as string)
		: `${supabaseUrl}/storage/v1/object/public/cabin-images/${imageName}`;

	let query = supabase.from("cabins");

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let builder: any;

	if (!id)
		builder = query.insert([
			{ ...newCabin, image: imagePath } as Record<string, unknown>,
		]);

	if (id)
		builder = query
			.update({ ...newCabin, image: imagePath } as Record<string, unknown>)
			.eq("id", id)
			.select();

	const { data, error } = await builder.select().single();

	if (error) {
		console.error(error);
		throw new Error("Cabin could not be created.");
	}

	if (hasImagePath) return data as Cabin;

	const { error: storageError } = await supabase.storage
		.from("cabin-images")
		.upload(imageName, newCabin.image as File);

	if (storageError) {
		await supabase.from("cabins").delete().eq("id", (data as Cabin).id);
		console.error(storageError);
		throw new Error(
			"Cabin image could not be uploaded and the cabin was not created..."
		);
	}
	return data as Cabin;
}

export async function deleteCabin(id: number): Promise<null> {
	const { data, error } = await supabase
		.from("cabins")
		.delete()
		.eq("id", id);

	if (error) {
		console.error(error);
		throw new Error("Cabins could not be deleted.");
	}
	return data;
}
