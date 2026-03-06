import styled from "styled-components";
import DashboardBox from "./DashboardBox";
import Heading from "../../ui/Heading";
import { useDarkMode } from "../../context/DarkModeContext";
import {
	AreaChart,
	Area,
	CartesianGrid,
	Tooltip,
	XAxis,
	YAxis,
	ResponsiveContainer,
} from "recharts";
import { eachDayOfInterval, format, subDays } from "date-fns";
import type { BookingAfterDate } from "../../types/domain";

export interface SalesChartProps {
	bookings: BookingAfterDate[];
	numDays: number;
}

const StyledSalesChart = styled(DashboardBox)`
	grid-column: 1 / -1;

	/* Hack to change grid line colors */
	& .recharts-cartesian-grid-horizontal line,
	& .recharts-cartesian-grid-vertical line {
		stroke: var(--color-grey-300);
	}
`;

/**
 * Render an area chart showing daily total and extras sales for the trailing `numDays` period.
 *
 * The component aggregates bookings by their `created_at` date to produce daily `totalSales` and
 * `extrasSales`, formats dates for the x-axis labels, and adapts colors for dark or light mode.
 *
 * @param bookings - Array of bookings used to compute per-day sales; each booking's `created_at`, `totalPrice`, and `extrasPrice` are used.
 * @param numDays - Number of days to include in the chart, ending with today.
 * @returns A React element containing a responsive area chart that visualizes daily total and extras sales for the specified date range.
 */
function SalesChart({ bookings, numDays }: SalesChartProps) {
	const { isDarkMode } = useDarkMode();

	const allDates = eachDayOfInterval({
		start: subDays(new Date(), numDays - 1),
		end: new Date(),
	});

	const salesMap = bookings.reduce((acc, booking) => {
		const key = format(new Date(booking.created_at), "yyyy-MM-dd");
		if (!acc[key]) {
			acc[key] = { totalSales: 0, extrasSales: 0 };
		}
		acc[key].totalSales += booking.totalPrice;
		acc[key].extrasSales += booking.extrasPrice;
		return acc;
	}, {} as Record<string, { totalSales: number; extrasSales: number }>);

	const data = allDates.map((date) => {
		const key = format(date, "yyyy-MM-dd");
		const label = format(date, "MMM dd");
		return {
			label,
			totalSales: salesMap[key]?.totalSales ?? 0,
			extrasSales: salesMap[key]?.extrasSales ?? 0,
		};
	});

	const colors = isDarkMode
		? {
				totalSales: { stroke: "#4f46e5", fill: "#4f46e5" },
				extrasSales: { stroke: "#22c55e", fill: "#22c55e" },
				text: "#e5e7eb",
				background: "#18212f",
		  }
		: {
				totalSales: { stroke: "#4f46e5", fill: "#c7d2fe" },
				extrasSales: { stroke: "#16a34a", fill: "#dcfce7" },
				text: "#374151",
				background: "#fff",
		  };

	return (
		<StyledSalesChart>
			<Heading as="h2">
				Sales from {format(allDates[0], "MMM dd yyyy")} &mdash;{" "}
				{format(allDates[allDates.length - 1], "MMM dd yyyy")}
			</Heading>
			<ResponsiveContainer height={300} width="100%">
				<AreaChart data={data}>
					<XAxis
						dataKey="label"
						tick={{ fill: colors.text }}
						tickLine={{ stroke: colors.text }}
					/>
					<YAxis
						unit="$"
						tick={{ fill: colors.text }}
						tickLine={{ stroke: colors.text }}
					/>
					<CartesianGrid strokeDasharray="4" />
					<Tooltip
						contentStyle={{ backgroundColor: colors.background }}
					/>
					<Area
						dataKey="totalSales"
						type="monotone"
						stroke={colors.totalSales.stroke}
						fill={colors.totalSales.fill}
						strokeWidth={2}
						name="Total Sales"
						unit="$"
					/>
					<Area
						dataKey="extrasSales"
						type="monotone"
						stroke={colors.extrasSales.stroke}
						fill={colors.extrasSales.fill}
						strokeWidth={2}
						name="Extras Sales"
						unit="$"
					/>
				</AreaChart>
			</ResponsiveContainer>
		</StyledSalesChart>
	);
}

export default SalesChart;
