import { useState, useEffect, type Dispatch, type SetStateAction } from "react";

export function useLocalStorageState<T>(
	initialState: T,
	key: string
): [T, Dispatch<SetStateAction<T>>] {
	const [value, setValue] = useState<T>(function () {
		const storedValue = localStorage.getItem(key);
		return storedValue ? (JSON.parse(storedValue) as T) : initialState;
	});

	useEffect(
		function () {
			localStorage.setItem(key, JSON.stringify(value));
		},
		[value, key]
	);

	return [value, setValue];
}
