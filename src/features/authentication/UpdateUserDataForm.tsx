import { useState } from "react";

import Button from "../../ui/Button";
import FileInput from "../../ui/FileInput";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";

import { useUser } from "./useUser";
import { useUpdateUser } from "./useUpdateUser";

/**
 * Renders a form for viewing and updating the current user's email, full name, and avatar.
 *
 * The form shows the email as read-only, provides an editable full-name input and an avatar file input, and includes Cancel and Update buttons. Submitting sends the updated full name and optional avatar; on successful update the avatar input and form are reset.
 *
 * @returns The rendered form element for updating user data.
 */
function UpdateUserDataForm() {
	// We don't need the loading state, and can immediately use the user data, because we know that it has already been loaded at this point
	const { user } = useUser();
	const email = user?.email ?? "";
	const userMetadata = user?.user_metadata as { fullName?: string; avatar?: string } | undefined;
	const currentFullName = userMetadata?.fullName ?? "";

	const { updateUser, isUpdating } = useUpdateUser();

	const [fullName, setFullName] = useState(currentFullName);
	const [avatar, setAvatar] = useState<File | null>(null);

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!fullName) return;
		updateUser(
			{ fullName, avatar },
			{
				onSuccess: () => {
					setAvatar(null);
					e.currentTarget.reset();
				},
			}
		);
	}

	function handleCancel() {
		setFullName(currentFullName);
		setAvatar(null);
	}

	return (
		<Form onSubmit={handleSubmit}>
			<FormRow label="Email address">
				<Input value={email} disabled />
			</FormRow>

			<FormRow label="Full name">
				<Input
					type="text"
					value={fullName}
					onChange={(e) => setFullName(e.target.value)}
					id="fullName"
					disabled={isUpdating}
				/>
			</FormRow>

			<FormRow label="Avatar image">
				<FileInput
					id="avatar"
					accept="image/*"
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
						if (e.target.files && e.target.files.length > 0) {
							setAvatar(e.target.files[0]);
						} else {
							setAvatar(null);
						}
					}}
					disabled={isUpdating}
				/>
			</FormRow>

			<FormRow>
				<Button
					type="reset"
					variation="secondary"
					disabled={isUpdating}
					onClick={handleCancel}
				>
					Cancel
				</Button>
				<Button disabled={isUpdating}>Update account</Button>
			</FormRow>
		</Form>
	);
}

export default UpdateUserDataForm;
