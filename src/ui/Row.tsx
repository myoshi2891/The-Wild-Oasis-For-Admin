import styled, { css } from "styled-components";

interface RowProps {
	$type?: "horizontal" | "vertical";
}

const Row = styled.div.attrs<RowProps>((props) => ({
	// React 19 では関数コンポーネントの defaultProps が無効化されるため、
	// 既定値は .attrs() で注入する（$type 未指定時は "vertical"）。
	$type: props.$type ?? "vertical",
}))`
	display: flex;

	${(props) =>
		props.$type === "horizontal" &&
		css`
			justify-content: space-between;
			align-items: center;
		`}
	${(props) =>
		props.$type === "vertical" &&
		css`
			flex-direction: column;
			gap: 1.6rem;
		`}
`;

export default Row;
