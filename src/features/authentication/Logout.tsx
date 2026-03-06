import ButtonIcon from "../../ui/ButtonIcon";
import SpinnerMini from "../../ui/SpinnerMini";
import { HiArrowRightOnRectangle } from "react-icons/hi2";
import { useLogout } from "./useLogout";

/**
 * Renders a logout button that triggers the logout action and shows loading state.
 *
 * @returns The button element that is disabled while logout is in progress and displays a spinner when loading. 
 */
function Logout() {
	const { logout, isLoading } = useLogout();
	return (
		<ButtonIcon disabled={isLoading} onClick={() => logout()}>
			{!isLoading ? <HiArrowRightOnRectangle /> : <SpinnerMini />}
		</ButtonIcon>
	);
}

export default Logout;
