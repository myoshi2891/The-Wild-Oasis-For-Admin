
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test/testUtils";

const mockUpdateSetting = vi.fn();

vi.mock("../useSettings", () => ({
	useSettings: () => ({
		isLoading: false,
		settings: {
			minBookingLength: 3,
			maxBookingLength: 30,
			maxGuestsPerBooking: 10,
			breakfastPrice: 15,
		},
	}),
}));

vi.mock("../useUpdateSetting", () => ({
	useUpdateSetting: () => ({
		updateSetting: mockUpdateSetting,
		isUpdating: false,
	}),
}));

import UpdateSettingsForm from "../UpdateSettingsForm";

describe("UpdateSettingsForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("4つの設定項目を表示する", () => {
		renderWithProviders(<UpdateSettingsForm />);

		expect(
			screen.getByLabelText(/minimum nights/i)
		).toBeInTheDocument();
		expect(
			screen.getByLabelText(/maximum nights/i)
		).toBeInTheDocument();
		expect(
			screen.getByLabelText(/maximum guests/i)
		).toBeInTheDocument();
		expect(
			screen.getByLabelText(/breakfast price/i)
		).toBeInTheDocument();
	});

	it("設定値がデフォルト値で表示される", () => {
		renderWithProviders(<UpdateSettingsForm />);

		expect(screen.getByLabelText(/minimum nights/i)).toHaveValue(3);
		expect(screen.getByLabelText(/maximum nights/i)).toHaveValue(30);
		expect(screen.getByLabelText(/maximum guests/i)).toHaveValue(10);
		expect(screen.getByLabelText(/breakfast price/i)).toHaveValue(15);
	});

	it("onBlur で updateSetting を呼び出す", async () => {
		const user = userEvent.setup();
		renderWithProviders(<UpdateSettingsForm />);

		const minNightsInput = screen.getByLabelText(/minimum nights/i);
		await user.clear(minNightsInput);
		await user.type(minNightsInput, "5");
		await user.tab(); // blur を発火

		expect(mockUpdateSetting).toHaveBeenCalledWith({
			minBookingLength: 5,
		});
	});

	it("空値では updateSetting を呼び出さない", async () => {
		const user = userEvent.setup();
		renderWithProviders(<UpdateSettingsForm />);

		const minNightsInput = screen.getByLabelText(/minimum nights/i);
		await user.clear(minNightsInput);
		await user.tab();

		expect(mockUpdateSetting).not.toHaveBeenCalled();
	});
});
