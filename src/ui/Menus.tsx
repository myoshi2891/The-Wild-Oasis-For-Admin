import {
	createContext,
	useContext,
	useState,
	type MouseEvent,
	type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { HiEllipsisVertical } from "react-icons/hi2";
import styled from "styled-components";
import { useOutsideClick } from "../hooks/useOutsideClick";

const Menu = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-end;
`;

const StyledToggle = styled.button`
	background: none;
	border: none;
	padding: 0.4rem;
	border-radius: var(--border-radius-sm);
	transform: translateX(0.8rem);
	transition: all 0.2s;

	&:hover {
		background-color: var(--color-grey-100);
	}

	& svg {
		width: 2.4rem;
		height: 2.4rem;
		color: var(--color-grey-700);
	}
`;

interface Position {
	x: number;
	y: number;
}

const StyledList = styled.ul<{ $position: Position }>`
	position: fixed;

	background-color: var(--color-grey-0);
	box-shadow: var(--shadow-md);
	border-radius: var(--border-radius-md);

	right: ${(props) => props.$position.x}px;
	top: ${(props) => props.$position.y}px;
`;

const StyledButton = styled.button`
	width: 100%;
	text-align: left;
	background: none;
	border: none;
	padding: 1.2rem 2.4rem;
	font-size: 1.4rem;
	transition: all 0.2s;

	display: flex;
	align-items: center;
	gap: 1.6rem;

	&:hover {
		background-color: var(--color-grey-50);
	}

	& svg {
		width: 1.6rem;
		height: 1.6rem;
		color: var(--color-grey-400);
		transition: all 0.3s;
	}
`;

interface MenusContextType {
	openId: string;
	close: () => void;
	open: (id: string) => void;
	position: Position | null;
	setPosition: (pos: Position) => void;
}

const MenusContext = createContext<MenusContextType | undefined>(undefined);

/**
 * Access the Menus compound component context.
 *
 * @returns The current `MenusContextType` value from the nearest `Menus` provider.
 * @throws Error if called outside of a `Menus` provider (i.e., when the context is undefined).
 */
function useMenusContext(): MenusContextType {
	const context = useContext(MenusContext);
	if (!context)
		throw new Error("Menus compound components must be used within a <Menus>");
	return context;
}

/**
 * Provides menu state and control functions to descendant components via MenusContext.
 *
 * @returns A React element that wraps `children` with a MenusContext provider supplying `openId`, `open`, `close`, `position`, and `setPosition`.
 */
function Menus({ children }: { children: ReactNode }) {
	const [openId, setOpenId] = useState("");
	const [position, setPosition] = useState<Position | null>(null);

	const close = () => {
		setOpenId("");
		setPosition(null);
	};
	const open = setOpenId;

	return (
		<MenusContext.Provider
			value={{ openId, close, open, position, setPosition }}
		>
			{children}
		</MenusContext.Provider>
	);
}

/**
 * Renders a toggle button that opens or closes the menu identified by the given id.
 *
 * @param id - The unique identifier of the menu this toggle controls
 * @returns The button element used to control the menu's open state
 */
function Toggle({ id }: { id: string }) {
	const { openId, close, open, setPosition } = useMenusContext();
	const isOpen = openId === id;

	function handleClick(e: MouseEvent<HTMLButtonElement>) {
		e.stopPropagation();
		const rect = e.currentTarget.getBoundingClientRect();
		setPosition({
			x: window.innerWidth - rect.width - rect.x,
			y: rect.y + rect.height + 8,
		});

		if (openId === "" || openId !== id) {
			open(id);
		} else {
			close();
		}
	}

	return (
		<StyledToggle
			type="button"
			onClick={handleClick}
			aria-label={isOpen ? "Close menu" : "Open menu"}
			aria-haspopup="menu"
			aria-expanded={isOpen}
		>
			<HiEllipsisVertical aria-hidden="true" />
		</StyledToggle>
	);
}

/**
 * Renders the popup menu list into a portal attached to document.body when its associated menu is open and positioned.
 *
 * @param id - Identifier of the menu this list corresponds to; the list is rendered only when the context's openId matches this `id`.
 * @param children - Menu item nodes to be rendered inside the list.
 * @returns The menu list element rendered into `document.body` when open and a position is available, `null` otherwise.
 */
function List({ id, children }: { id: string; children: ReactNode }) {
	const { openId, position, close } = useMenusContext();
	const ref = useOutsideClick<HTMLUListElement>(close, false);

	if (openId !== id || !position) return null;

	return createPortal(
		<StyledList $position={position} ref={ref}>
			{children}
		</StyledList>,
		document.body
	);
}

/**
 * Renders a menu item button that executes an optional action and then closes the menu.
 *
 * @param children - Visible label or content for the menu item.
 * @param icon - Icon node displayed to the left of the label.
 * @param onClick - Optional callback invoked when the item is activated.
 * @param disabled - If `true`, the item is inert and will not invoke `onClick` or close the menu.
 * @returns The list item element containing the styled menu button.
 */
function MenuButton({
	children,
	icon,
	onClick,
	disabled,
}: {
	children: ReactNode;
	icon: ReactNode;
	onClick?: () => void;
	disabled?: boolean;
}) {
	const { close } = useMenusContext();

	function handleClick() {
		if (disabled) return;
		onClick?.();
		close();
	}

	return (
		<li>
			<StyledButton type="button" onClick={handleClick} disabled={disabled}>
				{icon}
				<span>{children}</span>
			</StyledButton>
		</li>
	);
}

Menus.Menu = Menu;
Menus.Toggle = Toggle;
Menus.List = List;
Menus.Button = MenuButton;

export default Menus;
