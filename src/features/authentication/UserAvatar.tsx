import styled from "styled-components";
import { useUser } from "./useUser";

const StyledUserAvatar = styled.div`
  display: flex;
  gap: 1.2rem;
  align-items: center;
  font-weight: 500;
  font-size: 1.4rem;
  color: var(--color-grey-600);
`;

const Avatar = styled.img`
  display: block;
  width: 4rem;
  width: 3.6rem;
  aspect-ratio: 1;
  object-fit: cover;
  object-position: center;
  border-radius: 50%;
  outline: 2px solid var(--color-grey-100);
`;

/**
 * Renders a user avatar and display name, using available profile metadata or sensible fallbacks.
 *
 * If a profile `avatar` URL is present it will be used; otherwise a default image is shown.
 * The displayed name and the image `alt` text prefer `fullName`, then the user's email, and finally the literal "Unknown user".
 *
 * @returns A React element containing the user's avatar image and display name.
 */
function UserAvatar() {
	const { user } = useUser();
	const { fullName, avatar } = (user?.user_metadata as { fullName?: string; avatar?: string }) || {};

	const fallbackName = fullName || user?.email || "Unknown user";

	return (
		<StyledUserAvatar>
			<Avatar
				src={avatar || "default-user.jpg"}
				alt={`Avatar of ${fallbackName}`}
			/>
			<span>{fallbackName}</span>
		</StyledUserAvatar>
	);
}

export default UserAvatar;
