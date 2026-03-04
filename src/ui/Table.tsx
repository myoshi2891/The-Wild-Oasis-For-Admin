import { createContext, useContext, type ReactNode } from "react";
import styled from "styled-components";

const StyledTable = styled.div`
	border: 1px solid var(--color-grey-200);

	font-size: 1.4rem;
	background-color: var(--color-grey-0);
	border-radius: 7px;
	overflow: hidden;
`;

const CommonRow = styled.div<{ $columns: string }>`
	display: grid;
	grid-template-columns: ${(props) => props.$columns};
	column-gap: 2.4rem;
	align-items: center;
	transition: none;
`;

const StyledHeader = styled(CommonRow)`
	padding: 1.6rem 2.4rem;

	background-color: var(--color-grey-50);
	border-bottom: 1px solid var(--color-grey-100);
	text-transform: uppercase;
	letter-spacing: 0.4px;
	font-weight: 600;
	color: var(--color-grey-600);
`;

const StyledRow = styled(CommonRow)`
	padding: 1.2rem 2.4rem;

	&:not(:last-child) {
		border-bottom: 1px solid var(--color-grey-100);
	}
`;

const StyledBody = styled.section`
	margin: 0.4rem 0;
`;

const Footer = styled.footer`
	background-color: var(--color-grey-50);
	display: flex;
	justify-content: center;
	padding: 1.2rem;

	/* This will hide the footer when it contains no child elements. Possible thanks to the parent selector :has 🎉 */
	&:not(:has(*)) {
		display: none;
	}
`;

const Empty = styled.p`
	font-size: 1.6rem;
	font-weight: 500;
	text-align: center;
	margin: 2.4rem;
`;

interface TableContextType {
	columns: string;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

/**
 * Retrieves the current Table context for Table compound components.
 *
 * @returns The current table context containing the `columns` value.
 * @throws Error if called outside of a `<Table>` provider.
 */
function useTableContext(): TableContextType {
	const context = useContext(TableContext);
	if (!context)
		throw new Error("Table compound components must be used within a <Table>");
	return context;
}

/**
 * Provides table layout context and renders a styled table wrapper for its children.
 *
 * @param columns - A CSS `grid-template-columns` string that defines column widths for rows (e.g., `"1fr 2fr 100px"`).
 * @returns A React element that supplies the table context and renders `children` inside the styled table.
 */
function Table({
	columns,
	children,
}: {
	columns: string;
	children: ReactNode;
}) {
	return (
		<TableContext.Provider value={{ columns }}>
			<StyledTable role="table">{children}</StyledTable>
		</TableContext.Provider>
	);
}

/**
 * Renders a table header row using the current table's column template from context.
 *
 * @param children - Content to render inside the header row
 * @returns The header row element configured with the table's column layout
 */
function Header({ children }: { children: ReactNode }) {
	const { columns } = useTableContext();
	return (
		<StyledHeader role="row" $columns={columns} as="header">
			{children}
		</StyledHeader>
	);
}
/**
 * Renders a table row that applies the current table column layout from context.
 *
 * @returns A `row` element (`StyledRow`) with the context's grid columns applied and the given children rendered inside.
 */
function Row({ children }: { children: ReactNode }) {
	const { columns } = useTableContext();
	return (
		<StyledRow role="row" $columns={columns}>
			{children}
		</StyledRow>
	);
}

/**
 * Renders a table body from an array of items or shows an empty placeholder when no items exist.
 *
 * @param data - Array of items to render as rows.
 * @param render - Function that maps each item to a React node to be rendered inside the body.
 * @returns The body element containing the rendered rows, or an `Empty` placeholder when `data` is empty.
 */
function Body<T>({ data, render }: { data: T[]; render: (item: T) => ReactNode }) {
	if (!data.length) return <Empty>No data to show at the moment...</Empty>;
	return <StyledBody>{data.map(render)}</StyledBody>;
}

Table.Header = Header;
Table.Body = Body;
Table.Row = Row;
Table.Footer = Footer;

export default Table;
