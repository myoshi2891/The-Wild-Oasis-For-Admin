import {
	cloneElement,
	createContext,
	useContext,
	useState,
	type MouseEvent as ReactMouseEvent,
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

/**
 * Retrieves the current modal context for Modal compound components.
 *
 * @returns The `ModalContextType` object with `openName`, `open`, and `close`.
 * @throws Error if called outside of a `<Modal>` provider (no context available).
 */
function useModalContext(): ModalContextType {
	const context = useContext(ModalContext);
	if (!context)
		throw new Error("Modal compound components must be used within a <Modal>");
	return context;
}

/**
 * Supplies modal state and control functions to nested modal compound components.
 *
 * The provider exposes `openName`, `open(name)`, and `close()` via context so descendant
 * components (e.g., `Modal.Open` and `Modal.Window`) can coordinate which modal window is shown.
 *
 * @param children - React nodes that consume the modal context
 * @returns A React element that provides modal context to its children
 */
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

/**
 * Wraps a clickable React element so activating it opens the specified modal window.
 *
 * @param children - The element to clone and augment; its existing `onClick` (if any) is preserved.
 * @param opens - The name of the modal window to open when the element is clicked.
 * @returns The provided element cloned with its `onClick` handler enhanced to call the original handler (if present) and then open the modal named by `opens`.
 */
function Open({
	children,
	opens: opensWindowName,
}: {
	children: ReactElement<{ onClick?: (e: ReactMouseEvent) => void }>;
	opens: string;
}) {
	const { open } = useModalContext();

	return cloneElement(children, {
		onClick: (e: ReactMouseEvent) => {
			children.props.onClick?.(e);
			open(opensWindowName);
		},
	});
}

/**
 * Renders a named modal window as a portal when its name matches the current open modal.
 *
 * The provided `children` element is cloned and receives an `onCloseModal` prop that calls
 * the child's original `onCloseModal` (if present) and then closes the modal. The modal
 * also includes a close button and will close when clicking outside its content.
 *
 * @param children - Modal content element that may accept an `onCloseModal` callback; it will be cloned with an injected `onCloseModal` that closes the modal after invoking the original.
 * @param name - Identifier for this modal window; the modal is rendered only when this equals the context's open name.
 * @returns A portal containing the modal when `name` equals the current open modal name, `null` otherwise.
 */
function Window({
	children,
	name,
}: {
	children: ReactElement<{ onCloseModal?: () => void }>;
	name: string;
}) {
	const { openName, close } = useModalContext();

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
