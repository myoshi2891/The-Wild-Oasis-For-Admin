import styled, { css } from "styled-components";

interface FormProps {
	$type?: "regular" | "modal";
}

const Form = styled.form.attrs<FormProps>((props) => ({
	// React 19 では関数コンポーネントの defaultProps が無効化されるため、
	// 既定値は .attrs() で注入する（$type 未指定時は "regular"）。
	$type: props.$type ?? "regular",
}))`
	${(props) =>
		props.$type === "regular" &&
		css`
			padding: 2.4rem 4rem;

			/* Box */
			background-color: var(--color-grey-0);
			border: 1px solid var(--color-grey-100);
			border-radius: var(--border-radius-md);
		`}

	${(props) =>
		props.$type === "modal" &&
		css`
			width: 80rem;
		`}
    
  overflow: hidden;
	font-size: 1.4rem;
`;

export default Form;
