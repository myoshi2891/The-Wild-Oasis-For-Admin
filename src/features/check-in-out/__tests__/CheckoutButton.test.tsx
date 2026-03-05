import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test/testUtils";

const mockCheckout = vi.fn();

vi.mock("../useCheckout", () => ({
	useCheckout: () => ({ checkout: mockCheckout, isCheckingOut: false }),
}));

import CheckoutButton from "../CheckoutButton";

describe("CheckoutButton", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("'Check out' ボタンを描画する", () => {
		renderWithProviders(<CheckoutButton bookingId={42} />);
		expect(
			screen.getByRole("button", { name: /check out/i })
		).toBeInTheDocument();
	});

	it("クリックで checkout を呼び出す", async () => {
		const user = userEvent.setup();
		renderWithProviders(<CheckoutButton bookingId={42} />);

		await user.click(
			screen.getByRole("button", { name: /check out/i })
		);

		expect(mockCheckout).toHaveBeenCalledWith(42);
	});
});
