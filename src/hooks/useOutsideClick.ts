import { useEffect, useRef } from "react";

/**
 * Calls a handler when a click occurs outside the attached element.
 *
 * @param handler - Function invoked when a click happens outside the referenced element.
 * @param listenCapturing - Whether to register the click listener in the capture phase; defaults to `true`.
 * @returns A ref object to attach to the element to monitor for outside clicks.
 */
export function useOutsideClick<T extends HTMLElement = HTMLElement>(
	handler: () => void,
	listenCapturing = true
) {
	const ref = useRef<T>(null);

	useEffect(
		function () {
			function handleClick(e: MouseEvent) {
				if (ref.current && !ref.current.contains(e.target as Node)) {
					handler();
				}
			}

			document.addEventListener("click", handleClick, listenCapturing);

			return () =>
				document.removeEventListener(
					"click",
					handleClick,
					listenCapturing
				);
		},
		[handler, listenCapturing]
	);
	return ref;
}
