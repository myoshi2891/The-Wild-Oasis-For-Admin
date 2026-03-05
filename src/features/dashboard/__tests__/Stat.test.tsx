import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Stat from "../Stat";
import { HiOutlineBriefcase } from "react-icons/hi2";

describe("Stat", () => {
	it("icon, title, value を表示する", () => {
		render(
			<Stat
				icon={<HiOutlineBriefcase />}
				title="Bookings"
				value="25"
				color="blue"
			/>
		);

		expect(screen.getByText("Bookings")).toBeInTheDocument();
		expect(screen.getByText("25")).toBeInTheDocument();
	});
});
