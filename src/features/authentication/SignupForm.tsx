import { useForm } from "react-hook-form";
import Button from "../../ui/Button";
import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import { useSignup } from "./useSignup";

// Email regex: /\S+@\S+\.\S+/

import type { SignupFormData } from "../../types/domain";

/**
 * Render a signup form with client-side validation and submission handling.
 *
 * The form includes inputs for full name, email, password, and password confirmation,
 * validates each field (required, email pattern, password minimum length, matching passwords),
 * disables inputs while a signup request is in progress, and resets on successful signup.
 *
 * @returns A `JSX.Element` containing the signup form with submit and reset actions.
 */
function SignupForm() {
	const { signup, isLoading } = useSignup();
	const { register, formState, getValues, handleSubmit, reset } = useForm<SignupFormData>();
	const { errors } = formState;

	function onSubmit({ fullName, email, password, passwordConfirm }: SignupFormData) {
		signup(
			{ fullName, email, password, passwordConfirm },
			{
				onSuccess: () => reset(),
			}
		);
	}

	return (
		<Form onSubmit={handleSubmit(onSubmit)}>
			<FormRow label="Full name" error={errors?.fullName?.message as string}>
				<Input
					type="text"
					id="fullName"
					disabled={isLoading}
					{...register("fullName", {
						required: "This field is required",
					})}
				/>
			</FormRow>

			<FormRow label="Email address" error={errors?.email?.message as string}>
				<Input
					type="email"
					id="email"
					disabled={isLoading}
					{...register("email", {
						required: "This field is required",
						pattern: {
							value: /\S+@\S+\.\S+/,
							message: "Please provide a valid email address",
						},
					})}
				/>
			</FormRow>

			<FormRow
				label="Password (min 8 characters)"
				error={errors?.password?.message as string}
			>
				<Input
					type="password"
					id="password"
					disabled={isLoading}
					{...register("password", {
						required: "This field is required",
						minLength: {
							value: 8,
							message: "Password needs at least 8 characters",
						},
					})}
				/>
			</FormRow>

			<FormRow
				label="Repeat password"
				error={errors?.passwordConfirm?.message as string}
			>
				<Input
					type="password"
					id="passwordConfirm"
					disabled={isLoading}
					{...register("passwordConfirm", {
						required: "This field is required",
						validate: (value) =>
							value === getValues().password ||
							"Passwords need to be matched",
					})}
				/>
			</FormRow>

			<FormRow>
				{/* type is an HTML attribute! */}
				<Button
					variation="secondary"
					type="reset"
					disabled={isLoading}
					onClick={() => reset()}
				>
					Cancel
				</Button>
				<Button disabled={isLoading}>Create new user</Button>
			</FormRow>
		</Form>
	);
}

export default SignupForm;
