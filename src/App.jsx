import styled from "styled-components";
import Button from "./ui/Button";
import GlobalStyles from "./styles/GlobalStyles";
import Input from "./ui/Input";
import Heading from "./ui/Heading";

const StyledApp = styled.main`
	background-color: orangered;
	padding: 20px;
`;

function App() {
	return (
		<>
			<GlobalStyles />
			<StyledApp>
				<Heading as="h1">The Wild Oasis</Heading>
				<Heading as="h2">Check in and out</Heading>
				<Button onClick={() => alert("Check in")}>Check in</Button>
				<Button onClick={() => alert("Check out")}>Check out</Button>
				<Heading as="h3">Form</Heading>

				<Input type="number" placeholder="Number of guest" />
			</StyledApp>
		</>
	);
}

export default App;
