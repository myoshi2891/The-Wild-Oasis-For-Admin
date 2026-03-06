import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import Button from "../../ui/Button";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";

import { useUpdateUser } from "./useUpdateUser";

interface UpdatePasswordFormValues {
  password: string;
  passwordConfirm: string;
}

/**
 * Renders a password update form with client-side validation and submission handling.
 *
 * The form validates a new password (minimum 8 characters) and a matching confirmation field,
 * submits the updated password via the user-update hook, and resets the form on successful update.
 *
 * @returns The rendered form component for updating a user's password.
 */
function UpdatePasswordForm() {
  const { register, handleSubmit, formState, getValues, reset } = useForm<UpdatePasswordFormValues>();
  const { errors } = formState;

  const { updateUser, isUpdating } = useUpdateUser();

  const onSubmit: SubmitHandler<UpdatePasswordFormValues> = ({ password }) => {
    updateUser({ password }, { onSettled: () => reset() });
  };

  return (
		<Form onSubmit={handleSubmit(onSubmit)}>
			<FormRow
				label="New Password (min 8 chars)"
				error={errors?.password?.message as string}
			>
				<Input
					type="password"
					id="password"
					autoComplete="current-password"
					disabled={isUpdating}
					{...register("password", {
						required: "This field is required",
						minLength: {
							value: 8,
							message: "Password needs a minimum of 8 characters",
						},
					})}
				/>
			</FormRow>

			<FormRow
				label="Confirm password"
				error={errors?.passwordConfirm?.message as string}
			>
				<Input
					type="password"
					autoComplete="new-password"
					id="passwordConfirm"
					disabled={isUpdating}
					{...register("passwordConfirm", {
						required: "This field is required",
						validate: (value) =>
							getValues().password === value ||
							"Passwords need to match",
					})}
				/>
			</FormRow>
			<FormRow>
				<Button onClick={() => reset()} type="reset" variation="secondary" disabled={isUpdating}>
					Cancel
				</Button>
				<Button disabled={isUpdating}>Update password</Button>
			</FormRow>
		</Form>
  );
}

export default UpdatePasswordForm;
