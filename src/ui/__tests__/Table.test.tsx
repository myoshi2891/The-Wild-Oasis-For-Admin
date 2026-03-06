import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Table from "../Table";

describe("Table", () => {
	it("Header / Row / Body を正しく描画する", () => {
		render(
			<Table columns="1fr 1fr">
				<Table.Header>
					<div>Col 1</div>
					<div>Col 2</div>
				</Table.Header>
				<Table.Body
					data={["Row A", "Row B"]}
					render={(item) => (
						<Table.Row key={item}>
							<div>{item}</div>
							<div>Value</div>
						</Table.Row>
					)}
				/>
			</Table>
		);

		expect(screen.getByText("Col 1")).toBeInTheDocument();
		expect(screen.getByText("Col 2")).toBeInTheDocument();
		expect(screen.getByText("Row A")).toBeInTheDocument();
		expect(screen.getByText("Row B")).toBeInTheDocument();
	});

	it("空データの場合に 'No data' メッセージを表示する", () => {
		render(
			<Table columns="1fr">
				<Table.Body
					data={[]}
					render={(item: string) => <div key={item}>{item}</div>}
				/>
			</Table>
		);

		expect(
			screen.getByText("No data to show at the moment...")
		).toBeInTheDocument();
	});

	it("Table コンテキスト外で Row を使うとエラーを投げる", () => {
		// Suppress console.error for this expected error
		const consoleSpy = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});

		expect(() => {
			render(
				<Table.Row>
					<div>Orphan</div>
				</Table.Row>
			);
		}).toThrow("Table compound components must be used within a <Table>");

		consoleSpy.mockRestore();
	});
});
