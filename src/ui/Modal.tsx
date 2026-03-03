import {
	cloneElement,
	createContext,
	useContext,
	useState,
	type ReactElement,
	type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { HiXMark } from "react-icons/hi2";
import styled from "styled-components";
import { useOutsideClick } from "../hooks/useOutsideClick";

const StyledModal = styled.div`
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	background-color: var(--color-grey-0);
	border-radius: var(--border-radius-lg);
	box-shadow: var(--shadow-lg);
	padding: 3.2rem 4rem;
	transition: all 0.5s;
`;

const Overlay = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100vh;
	background-color: var(--backdrop-color);
	backdrop-filter: blur(4px);
	z-index: 1000;
	transition: all 0.5s;
`;

const CloseButton = styled.button`
	background: none;
	border: none;
	padding: 0.4rem;
	border-radius: var(--border-radius-sm);
	transform: translateX(0.8rem);
	transition: all 0.2s;
	position: absolute;
	top: 1.2rem;
	right: 1.9rem;

	&:hover {
		background-color: var(--color-grey-100);
	}

	& svg {
		width: 2.4rem;
		height: 2.4rem;
		color: var(--color-grey-500);
	}
`;

interface ModalContextType {
	openName: string;
	close: () => void;
	open: (name: string) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

function Modal({ children }: { children: ReactNode }) {
	const [openName, setOpenName] = useState("");
	const close = () => setOpenName("");
	const open = setOpenName;

	return (
		<ModalContext.Provider value={{ openName, close, open }}>
			{children}
		</ModalContext.Provider>
	);
}

function Open({
	children,
	opens: opensWindowName,
}: {
	children: ReactElement<{ onClick?: () => void }>;
	opens: string;
}) {
	const { open } = useContext(ModalContext)!;

	return cloneElement(children, {
		onClick: () => {
			children.props.onClick?.();
			open(opensWindowName);
		},
	});
}

function Window({
	children,
	name,
}: {
	children: ReactElement<{ onCloseModal?: () => void }>;
	name: string;
}) {
	const { openName, close } = useContext(ModalContext)!;

	const ref = useOutsideClick<HTMLDivElement>(close);
	if (name !== openName) return null;

	return createPortal(
		<Overlay>
			<StyledModal ref={ref}>
				<CloseButton onClick={close} aria-label="Close">
					<HiXMark aria-hidden="true" />
				</CloseButton>
				<div>
				{cloneElement(children, {
					onCloseModal: () => {
						children.props.onCloseModal?.();
						close();
					},
				})}
				</div>
			</StyledModal>
		</Overlay>,
		document.body
	);
}

Modal.Open = Open;
Modal.Window = Window;

export default Modal;
