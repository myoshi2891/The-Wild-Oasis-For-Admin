import { useState } from "react";
import Button from "../../ui/Button";
import Form from "../../ui/Form";
import Input from "../../ui/Input";
import SpinnerMini from "../../ui/SpinnerMini";
import FormRowVertical from "../../ui/FormRowVertical";
import { login } from "../../services/apiAuth";
import { useLogin } from "./useLogin";

function LoginForm() {
	const [email, setEmail] = useState("john@example.com");
	const [password, setPassword] = useState(
		import.meta.env.VITE_SUPABASE_USER_PASSWORD
	);
	const { login, isLoading } = useLogin();

	function handleSubmit(e) {
		e.preventDefault();
		if (!email || !password) return;
		login({ email, password });
	}

	return (
		<Form onSubmit={handleSubmit}>
			<FormRowVertical label="Email address">
				<Input
					type="email"
					id="email"
					// This makes this form better for password managers
					autoComplete="username"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					disabled={isLoading}
				/>
			</FormRowVertical>
			<FormRowVertical label="Password">
				<Input
					type="password"
					id="password"
					autoComplete="current-password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					disabled={isLoading}
				/>
			</FormRowVertical>
			<FormRowVertical>
				<Button size="large" disabled={isLoading}>
					{!isLoading ? "Login" : <SpinnerMini />}
				</Button>
			</FormRowVertical>
		</Form>
	);
}

export default LoginForm;
