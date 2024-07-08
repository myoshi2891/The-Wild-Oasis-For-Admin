import { useEffect, useReducer } from "react";
import Header from "./Header";
import Main from "./Main";

const initialState = {
	questions: [],
	status: "loading",
};

function reducer(state, action) {
	switch (action.type) {
		case "dataRecieved":
			return {
				...state,
				questions: action.payload,
				status: "ready",
			};
		case "dataFailed":
			return {
				...state,
				status: "error",
			};
		default:
			throw new Error("Action Unknown...");
	}
}

export default function App() {
	const [state, dispatch] = useReducer(reducer, initialState);

	useEffect(function () {
		fetch("http://localhost:8000/questions")
			.then((res) => res.json())
			.then((data) => dispatch({ type: "dataRecieved", payload: data }))
			.catch((err) => dispatch({ type: "dataFailed" }));

		return () => {};
	}, []);

	return (
		<div className="app">
			<Header />

			<Main>
				<p>1/15</p>
				<p>Question?</p>
			</Main>
		</div>
	);
}
