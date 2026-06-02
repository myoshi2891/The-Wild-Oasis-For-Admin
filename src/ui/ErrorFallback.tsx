import styled from "styled-components";
import Heading from "./Heading";
import GlobalStyles from "../styles/GlobalStyles";
import Button from "./Button";

const StyledErrorFallback = styled.main`
	height: 100vh;
	background-color: var(--color-grey-50);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 4.8rem;
`;

const Box = styled.div`
	/* Box */
	background-color: var(--color-grey-0);
	border: 1px solid var(--color-grey-100);
	border-radius: var(--border-radius-md);

	padding: 4.8rem;
	flex: 0 1 96rem;
	text-align: center;

	& h1 {
		margin-bottom: 1.6rem;
	}

	& p {
		font-family: "Sono";
		margin-bottom: 3.2rem;
		color: var(--color-grey-500);
	}
`;

interface ErrorFallbackProps {
	// react-error-boundary v6 では error が unknown 型（throw される値は Error とは限らない）
	error: unknown;
	resetErrorBoundary: () => void;
}

/**
 * Render a full-viewport error UI that displays the provided error message and a retry button.
 *
 * @param error - The thrown value (unknown). Its message is extracted safely via a type guard.
 * @param resetErrorBoundary - Callback invoked when the user clicks "Try again" to attempt recovery.
 * @returns The error fallback UI as a JSX element.
 */
function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
	// 型ガードで Error を絞り込み、それ以外は文字列化して表示する
	const message = error instanceof Error ? error.message : String(error);
	return (
		<>
			<GlobalStyles />
			<StyledErrorFallback>
				<Box>
					<Heading as="h1">Something went wrong...😭</Heading>
					<p>{message}</p>
					<Button size="large" onClick={resetErrorBoundary}>
						Try again
					</Button>
				</Box>
			</StyledErrorFallback>
		</>
	);
}

export default ErrorFallback;
