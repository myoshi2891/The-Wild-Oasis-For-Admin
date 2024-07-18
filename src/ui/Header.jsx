import { Link } from "react-router-dom";

function Header() {
	return (
		<header>
			<Link to="/">Fast React Pizza Co.</Link>
			<p>John Doe</p>
		</header>
	);
}

export default Header;
