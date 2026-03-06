import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import UserAvatar from "../UserAvatar";

// useUser のモック
vi.mock("../useUser", () => ({
	useUser: () => ({
		user: {
			user_metadata: {
				fullName: "John Doe",
				avatar: "https://example.com/avatar.jpg",
			},
		},
	}),
}));

describe("UserAvatar", () => {
	it("アバター画像とユーザー名を表示する", () => {
		render(<UserAvatar />);
		expect(screen.getByText("John Doe")).toBeInTheDocument();
		const img = screen.getByRole("img", { name: /avatar/i });
		expect(img).toHaveAttribute("src", "https://example.com/avatar.jpg");
	});
});
