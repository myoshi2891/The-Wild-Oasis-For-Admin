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

function useMenusContext(): MenusContextType {
	const context = useContext(MenusContext);
	if (!context)
		throw new Error("Menus compound components must be used within a <Menus>");
	return context;
}

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
