import type { ReactNode } from "react";
import styled from "styled-components";
import { useUser } from "../features/authentication/useUser";
import Spinner from "./Spinner";
import { useNavigate } from "react-router";
import { useEffect } from "react";

const FullPage = styled.div`
	height: 100vh;
	background-color: var(--color-grey-50);
	display: flex;
	align-items: center;
	justify-content: center;
`;

interface ProtectedRouteProps {
	children: ReactNode;
}

/**
 * Restricts access to its children to authenticated users and redirects unauthenticated users to "/login".
 *
 * @param children - Content to render when the user is authenticated.
 * @returns The `children` when `isAuthenticated` is true, a full-page loading spinner while `isLoading` is true, or `null` after initiating a redirect for unauthenticated users.
 */
function ProtectedRoute({ children }: ProtectedRouteProps) {
	const navigate = useNavigate();

	const { isLoading, isAuthenticated } = useUser();

	useEffect(
		function () {
			if (!isAuthenticated && !isLoading) navigate("/login");
		},
		[isAuthenticated, isLoading, navigate]
	);

	if (isLoading)
		return (
			<FullPage>
				<Spinner />
			</FullPage>
		);

	if (isAuthenticated) return children;

	return null;
}

export default ProtectedRoute;
