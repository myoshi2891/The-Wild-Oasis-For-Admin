import { useEffect, useReducer } from "react";
import Header from "./Header";
import Loader from "./Loader";
import Main from "./Main";
import Error from "./Error";
import StartScreen from "./StartScreen";
import Question from "./Question";

const initialState = {
	questions: [],
	status: "loading",
	index: 0,
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
		case "start":
			return {
				...state,
				status: "active",
			};
		default:
			throw new Error("Action Unknown...");
	}
}

export default function App() {
	const [{ questions, status, index }, dispatch] = useReducer(
		reducer,
		initialState
	);

	const numQuestions = questions.length;

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
				{status === "loading" && <Loader />}
				{status === "error" && <Error />}
				{status === "ready" && (
					<StartScreen
						numQuestions={numQuestions}
						dispatch={dispatch}
					/>
				)}
				{status === "active" && (
					<Question question={questions[index]} />
				)}
			</Main>
		</div>
	);
}
