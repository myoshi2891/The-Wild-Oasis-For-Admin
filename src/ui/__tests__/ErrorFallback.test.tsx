import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorFallback from "../ErrorFallback";

describe("ErrorFallback", () => {
	it("エラーメッセージを表示する", () => {
		const error = new Error("Something broke");
		render(
			<ErrorFallback error={error} resetErrorBoundary={() => {}} />
		);
		expect(screen.getByText("Something broke")).toBeInTheDocument();
		expect(
			screen.getByText(/Something went wrong/)
		).toBeInTheDocument();
	});

	it("Try again ボタンをクリックすると resetErrorBoundary が呼ばれる", async () => {
		const resetErrorBoundary = vi.fn();
		const user = userEvent.setup();

		render(
			<ErrorFallback
				error={new Error("Error")}
				resetErrorBoundary={resetErrorBoundary}
			/>
		);

		await user.click(screen.getByRole("button", { name: /try again/i }));
		expect(resetErrorBoundary).toHaveBeenCalledTimes(1);
	});
});
