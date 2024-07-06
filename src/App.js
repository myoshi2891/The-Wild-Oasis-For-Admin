import { useEffect, useState } from "react";

const tempMovieData = [
	{
		imdbID: "tt1375666",
		Title: "Inception",
		Year: "2010",
		Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
	},
	{
		imdbID: "tt0133093",
		Title: "The Matrix",
		Year: "1999",
		Poster: "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
	},
	{
		imdbID: "tt6751668",
		Title: "Parasite",
		Year: "2019",
		Poster: "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
	},
];

const tempWatchedData = [
	{
		imdbID: "tt1375666",
		Title: "Inception",
		Year: "2010",
		Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
		runtime: 148,
		imdbRating: 8.8,
		userRating: 10,
	},
	{
		imdbID: "tt0088763",
		Title: "Back to the Future",
		Year: "1985",
		Poster: "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
		runtime: 116,
		imdbRating: 8.5,
		userRating: 9,
	},
];

const average = (arr) =>
	arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const KEY = process.env.REACT_APP_KEY;

export default function App() {
	const [query, setQuery] = useState("inception");
	const [movies, setMovies] = useState([]);
	const [watched, setWatched] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const tempQuery = "interstellar";

	// useEffect(function () {
	// 	console.log("After initail render");
	// }, []);

	// useEffect(function () {
	// 	console.log("After everry render");
	// });

	// useEffect(
	// 	function () {
	// 		console.log("D");
	// 	},
	// 	[query]
	// );

	// console.log("During Render");

	useEffect(
		function () {
			async function fetchMovies() {
				try {
					setIsLoading(true);
					setError("");
					const res = await fetch(
						`https://www.omdbapi.com/?s=${query}&apikey=${KEY}`
					);

					if (!res.ok)
						throw new Error(
							"Something went wrong with fetching movies..."
						);

					const data = await res.json();
					if (data.Response === "False")
						throw new Error("Movie not found");

					setMovies(data.Search);
				} catch (err) {
					setError(err.message);
				} finally {
					setIsLoading(false);
				}
			}

			if (query.length < 3) {
				setMovies([]);
				setError("");
				return;
			}
			fetchMovies();
		},
		[query]
	);

	return (
		<>
			<NavBar>
				<Search query={query} setQuery={setQuery} />
				<NumResults movies={movies} />
			</NavBar>

			<Main>
				{/* <Box element={<MovieList movies={movies} />} />
				<Box
					element={
						<>
							<WatchedSummary watched={watched} />
							<WatchedMovieList watched={watched} />
						</>
					}
				/> */}
				<Box>
					{/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
					{isLoading && <Loader />}
					{!isLoading && !error && <MovieList movies={movies} />}
					{error && <ErrorMessage message={error} />}
				</Box>
				<Box>
					<WatchedSummary watched={watched} />
					<WatchedMovieList watched={watched} />
				</Box>
			</Main>
		</>
	);
}

function Loader() {
	return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
	return (
		<p className="error">
			<span>🤬</span>
			{message}
		</p>
	);
}

function NavBar({ children }) {
	return (
		<nav className="nav-bar">
			<Logo />
			{children}
		</nav>
	);
}

	return (
		<div>
			<div className="tabs">
				<Tab num={0} activeTab={activeTab} onClick={setActiveTab} />
				<Tab num={1} activeTab={activeTab} onClick={setActiveTab} />
				<Tab num={2} activeTab={activeTab} onClick={setActiveTab} />
				<Tab num={3} activeTab={activeTab} onClick={setActiveTab} />
			</div>

			{activeTab <= 2 ? (
				<TabContent
					item={content.at(activeTab)}
					key={content.at(activeTab).summary}
				/>
			) : (
				<DifferentContent />
			)}
		</div>
	);
}

function Search({ query, setQuery }) {

	return (
		<button
			className={activeTab === num ? "tab active" : "tab"}
			onClick={() => onClick(num)}
		>
			Tab {num + 1}
		</button>
	);
}

function TabContent({ item }) {
	const [showDetails, setShowDetails] = useState(true);
	const [likes, setLikes] = useState(0);

	function handleInc() {
		setLikes(likes + 1);
	}

	function handleTripleInc() {
		setLikes((likes) => likes + 1);
		setLikes((likes) => likes + 1);
		setLikes((likes) => likes + 1);
	}

	function handleUndo() {
		setShowDetails(true);
		setLikes(0);
	}

	function handleUndoLater() {
		setTimeout(handleUndo, 2000);
	}

	return (
		<div className="tab-content">
			<h4>{item.summary}</h4>
			{showDetails && <p>{item.details}</p>}

			<div className="tab-actions">
				<button onClick={() => setShowDetails((h) => !h)}>
					{showDetails ? "Hide" : "Show"} details
				</button>

				<div className="hearts-counter">
					<span>{likes} ❤️</span>
					<button onClick={handleInc}>+</button>
					<button onClick={handleTripleInc}>+++</button>
				</div>
			</div>

			<div className="tab-undo">
				<button onClick={handleUndo}>Undo</button>
				<button onClick={handleUndoLater}>Undo in 2s</button>
			</div>
		</div>
	);
}

function DifferentContent() {
  return (
    <div className="tab-content">
      <h4>I'm a DIFFERENT tab, so I reset state 💣💥</h4>
    </div>
  );
}

function WatchedMovie({ movie }) {
	return (
		<li key={movie.imdbID}>
			<img src={movie.Poster} alt={`${movie.Title} poster`} />
			<h3>{movie.Title}</h3>
			<div>
				<p>
					<span>⭐️</span>
					<span>{movie.imdbRating}</span>
				</p>
				<p>
					<span>🌟</span>
					<span>{movie.userRating}</span>
				</p>
				<p>
					<span>⏳</span>
					<span>{movie.runtime} min</span>
				</p>
			</div>
		</li>
	);
}