import type { Cabin, CreateCabinFormData } from "../../types/domain";
import type { CreateEditCabinData } from "../../services/apiCabins";
import Input from "../../ui/Input";
import Form from "../../ui/Form";
import Button from "../../ui/Button";
import FileInput from "../../ui/FileInput";
import Textarea from "../../ui/Textarea";
import FormRow from "../../ui/FormRow";

import { useForm } from "react-hook-form";
import { useCreateCabin } from "./useCreateCabin";
import { useEditCabin } from "./useEditCabin";

interface CreateCabinFormProps {
	cabinToEdit?: Cabin;
	onCloseModal?: () => void;
}

function CreateCabinForm({ cabinToEdit, onCloseModal }: CreateCabinFormProps) {
	const { isCreating, createCabin } = useCreateCabin();
	const { isEditing, editCabin } = useEditCabin();

	const editId = cabinToEdit?.id;
	const isEditSession = Boolean(editId);

	const { register, handleSubmit, reset, getValues, formState } =
		useForm<CreateCabinFormData>({
			defaultValues: isEditSession && cabinToEdit
				? {
						name: cabinToEdit.name,
						maxCapacity: cabinToEdit.maxCapacity,
						regularPrice: cabinToEdit.regularPrice,
						discount: cabinToEdit.discount,
						description: cabinToEdit.description,
						image: cabinToEdit.image,
					}
				: {},
		});
	const { errors } = formState;

	const isWorking = isCreating || isEditing;

	function onSubmit(data: CreateCabinFormData) {
		let image: File | string | undefined;
		if (typeof data.image === "string") {
			image = data.image;
		} else if (data.image instanceof FileList && data.image.length > 0) {
			image = data.image[0];
		} else if (data.image instanceof File) {
			image = data.image;
		} else {
			image = undefined;
		}

		if (isEditSession) {
			const payload = image !== undefined
				? { ...data, image }
				: { ...data };
			editCabin(
				{ newCabinData: payload as CreateEditCabinData, id: editId! },
				{
					onSuccess: () => {
						reset();
						onCloseModal?.();
					},
				}
			);
		} else {
			createCabin(
				{ ...data, image: image ?? "" } as CreateEditCabinData,
				{
					onSuccess: () => {
						reset();
					},
				}
			);
		}
	}

	function onError(_errors: Record<string, unknown>) {
		// console.log(errors);
	}

	return (
		<Form
			onSubmit={handleSubmit(onSubmit, onError)}
			$type={onCloseModal ? "modal" : "regular"}
		>
			<FormRow label="Cabin name" error={errors?.name?.message}>
				<Input
					type="text"
					id="name"
					disabled={isWorking}
					{...register("name", {
						required: "This field is required",
					})}
				/>
			</FormRow>

			<FormRow
				label="Maximum capacity"
				error={errors?.maxCapacity?.message}
			>
				<Input
					type="number"
					id="maxCapacity"
					disabled={isWorking}
					{...register("maxCapacity", {
						required: "This field is required",
						valueAsNumber: true,
						min: {
							value: 1,
							message: "Capacity should be at least 1",
						},
					})}
				/>
			</FormRow>

			<FormRow
				label="Regular price"
				error={errors?.regularPrice?.message}
			>
				<Input
					type="number"
					id="regularPrice"
					disabled={isWorking}
					{...register("regularPrice", {
						required: "This field is required",
						valueAsNumber: true,
						min: {
							value: 1,
							message: "Price should be at least 1",
						},
					})}
				/>
			</FormRow>

			<FormRow label="Discount" error={errors?.discount?.message}>
				<Input
					type="number"
					id="discount"
					disabled={isWorking}
					defaultValue={0}
					{...register("discount", {
						required: "This field is required",
						valueAsNumber: true,
						validate: (value) =>
							value <= getValues().regularPrice ||
							"Discount should be less than regular price.",
					})}
				/>
			</FormRow>

			<FormRow
				label="Description for website"
				error={errors?.description?.message}
			>
				<Textarea
					id="description"
					disabled={isWorking}
					defaultValue=""
					{...register("description", {
						required: "This field is required",
					})}
				/>
			</FormRow>

			<FormRow label="Cabin Photo">
				<FileInput
					id="image"
					accept="image/*"
					type="file"
					{...register("image", {
						required: isEditSession
							? false
							: "This field is required",
					})}
				/>
			</FormRow>

			<FormRow>
				{/* type is an HTML attribute! */}
				<Button
					variation="secondary"
					type="reset"
					onClick={() => onCloseModal?.()}
				>
					Cancel
				</Button>
				<Button disabled={isWorking}>
					{isEditSession ? "Edit cabin" : "Create new cabin"}
				</Button>
			</FormRow>
		</Form>
	);
}

export default CreateCabinForm;
