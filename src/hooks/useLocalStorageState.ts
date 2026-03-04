import { useState, useEffect, type Dispatch, type SetStateAction } from "react";

/**
 * Synchronizes a React state value with localStorage under the provided key.
 *
 * @param initialState - Fallback value used when no stored value exists or when reading/parsing fails
 * @param key - localStorage key to read from and persist to
 * @returns A tuple containing the current state value and a setter function to update it
 */
export function useLocalStorageState<T>(
	initialState: T,
	key: string
): [T, Dispatch<SetStateAction<T>>] {
	const [value, setValue] = useState<T>(function () {
		try {
			const storedValue = localStorage.getItem(key);
			return storedValue ? (JSON.parse(storedValue) as T) : initialState;
		} catch {
			return initialState;
		}
	});

	useEffect(
		function () {
			try {
				localStorage.setItem(key, JSON.stringify(value));
			} catch (err) {
				console.warn(`Failed to write to localStorage key "${key}":`, err);
			}
		},
		[value, key]
	);

	return [value, setValue];
}
