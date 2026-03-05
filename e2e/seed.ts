/**
 * E2E テスト用ダミーデータ注入スクリプト
 *
 * Usage:
 *   bun run e2e/seed.ts
 *
 * .env.local (or .env) の VITE_SUPABASE_URL / VITE_SUPABASE_KEY を使って
 * テスト用 Supabase プロジェクトに cabins, guests, bookings, settings を注入する。
 */

import { createClient } from "@supabase/supabase-js";
import { add, differenceInCalendarDays, isFuture, isPast, isToday } from "date-fns";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// ── 環境変数の読み込み ──────────────────────────────
// .env.local → .env の順で読み込み（Vite と同じ優先順位）
function loadEnv() {
	const __dirname = path.dirname(fileURLToPath(import.meta.url));
	const root = path.resolve(__dirname, "..");
	for (const file of [".env.local", ".env"]) {
		const envPath = path.join(root, file);
		if (fs.existsSync(envPath)) {
			const content = fs.readFileSync(envPath, "utf-8");
			for (const line of content.split("\n")) {
				const trimmed = line.trim();
				if (!trimmed || trimmed.startsWith("#")) continue;
				const eqIdx = trimmed.indexOf("=");
				if (eqIdx === -1) continue;
				const key = trimmed.slice(0, eqIdx);
				let value = trimmed.slice(eqIdx + 1);
				if (
					(value.startsWith('"') && value.endsWith('"')) ||
					(value.startsWith("'") && value.endsWith("'"))
				) {
					value = value.slice(1, -1).trim();
				}
				if (!process.env[key]) {
					process.env[key] = value;
				}
			}
		}
	}
}

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
	console.error(
		"❌ VITE_SUPABASE_URL / VITE_SUPABASE_KEY が設定されていません。"
	);
	console.error("   .env.local または .env に設定してください。");
	process.exit(1);
}

console.log(`🔗 Supabase: ${supabaseUrl}`);
const supabase = createClient(supabaseUrl, supabaseKey);

// ── ヘルパー ──────────────────────────────────────
function fromToday(numDays: number, withTime = false) {
	const date = add(new Date(), { days: numDays });
	if (!withTime) date.setUTCHours(0, 0, 0, 0);
	return date.toISOString().slice(0, -1);
}

function subtractDates(dateStr1: string, dateStr2: string): number {
	return differenceInCalendarDays(new Date(dateStr1), new Date(dateStr2));
}

// ── シードデータ ────────────────────────────────────
const imageUrl = `${supabaseUrl}/storage/v1/object/public/cabin-images/`;

const cabins = [
	{
		name: "001",
		maxCapacity: 2,
		regularPrice: 250,
		discount: 0,
		image: imageUrl + "cabin-001.jpg",
		description:
			"Discover the ultimate luxury getaway for couples in the cozy wooden cabin 001.",
	},
	{
		name: "002",
		maxCapacity: 2,
		regularPrice: 350,
		discount: 25,
		image: imageUrl + "cabin-002.jpg",
		description:
			"Escape to the serenity of nature and indulge in luxury in our cozy cabin 002.",
	},
	{
		name: "003",
		maxCapacity: 4,
		regularPrice: 300,
		discount: 0,
		image: imageUrl + "cabin-003.jpg",
		description:
			"Experience luxury family living in our medium-sized wooden cabin 003.",
	},
	{
		name: "004",
		maxCapacity: 4,
		regularPrice: 500,
		discount: 50,
		image: imageUrl + "cabin-004.jpg",
		description:
			"Indulge in the ultimate luxury family vacation in this medium-sized cabin 004.",
	},
	{
		name: "005",
		maxCapacity: 6,
		regularPrice: 350,
		discount: 0,
		image: imageUrl + "cabin-005.jpg",
		description:
			"Enjoy a comfortable and cozy getaway with your group or family in our spacious cabin 005.",
	},
	{
		name: "006",
		maxCapacity: 6,
		regularPrice: 800,
		discount: 100,
		image: imageUrl + "cabin-006.jpg",
		description:
			"Experience the epitome of luxury with your group or family in our spacious wooden cabin 006.",
	},
	{
		name: "007",
		maxCapacity: 8,
		regularPrice: 600,
		discount: 100,
		image: imageUrl + "cabin-007.jpg",
		description:
			"Accommodate your large group or multiple families in the spacious and grand wooden cabin 007.",
	},
	{
		name: "008",
		maxCapacity: 10,
		regularPrice: 1400,
		discount: 0,
		image: imageUrl + "cabin-008.jpg",
		description:
			"Experience the epitome of luxury and grandeur with your large group in our grand cabin 008.",
	},
];

const guests = [
	{
		fullName: "Jonas Schmedtmann",
		email: "hello@jonas.io",
		nationality: "Portugal",
		nationalID: "3525436345",
		countryFlag: "https://flagcdn.com/pt.svg",
	},
	{
		fullName: "Jonathan Smith",
		email: "johnsmith@test.eu",
		nationality: "Great Britain",
		nationalID: "4534593454",
		countryFlag: "https://flagcdn.com/gb.svg",
	},
	{
		fullName: "Jonatan Johansson",
		email: "jonatan@example.com",
		nationality: "Finland",
		nationalID: "9374074454",
		countryFlag: "https://flagcdn.com/fi.svg",
	},
	{
		fullName: "Jonas Mueller",
		email: "jonas@example.eu",
		nationality: "Germany",
		nationalID: "1233212288",
		countryFlag: "https://flagcdn.com/de.svg",
	},
	{
		fullName: "Jonas Anderson",
		email: "anderson@example.com",
		nationality: "Bolivia (Plurinational State of)",
		nationalID: "0988520146",
		countryFlag: "https://flagcdn.com/bo.svg",
	},
	{
		fullName: "Jonathan Williams",
		email: "jowi@gmail.com",
		nationality: "United States of America",
		nationalID: "633678543",
		countryFlag: "https://flagcdn.com/us.svg",
	},
	{
		fullName: "Emma Watson",
		email: "emma@gmail.com",
		nationality: "United Kingdom",
		nationalID: "1234578901",
		countryFlag: "https://flagcdn.com/gb.svg",
	},
	{
		fullName: "Mohammed Ali",
		email: "mohammedali@yahoo.com",
		nationality: "Egypt",
		nationalID: "987543210",
		countryFlag: "https://flagcdn.com/eg.svg",
	},
	{
		fullName: "Maria Rodriguez",
		email: "maria@gmail.com",
		nationality: "Spain",
		nationalID: "1098765321",
		countryFlag: "https://flagcdn.com/es.svg",
	},
	{
		fullName: "Li Mei",
		email: "li.mei@hotmail.com",
		nationality: "China",
		nationalID: "102934756",
		countryFlag: "https://flagcdn.com/cn.svg",
	},
	{
		fullName: "Khadija Ahmed",
		email: "khadija@gmail.com",
		nationality: "Sudan",
		nationalID: "1023457890",
		countryFlag: "https://flagcdn.com/sd.svg",
	},
	{
		fullName: "Gabriel Silva",
		email: "gabriel@gmail.com",
		nationality: "Brazil",
		nationalID: "109283465",
		countryFlag: "https://flagcdn.com/br.svg",
	},
	{
		fullName: "Maria Gomez",
		email: "maria@example.com",
		nationality: "Mexico",
		nationalID: "108765421",
		countryFlag: "https://flagcdn.com/mx.svg",
	},
	{
		fullName: "Ahmed Hassan",
		email: "ahmed@gmail.com",
		nationality: "Egypt",
		nationalID: "1077777777",
		countryFlag: "https://flagcdn.com/eg.svg",
	},
	{
		fullName: "John Doe",
		email: "johndoe@gmail.com",
		nationality: "United States",
		nationalID: "3245908744",
		countryFlag: "https://flagcdn.com/us.svg",
	},
	{
		fullName: "Fatima Ahmed",
		email: "fatima@example.com",
		nationality: "Pakistan",
		nationalID: "1089999363",
		countryFlag: "https://flagcdn.com/pk.svg",
	},
	{
		fullName: "David Smith",
		email: "david@gmail.com",
		nationality: "Australia",
		nationalID: "44450960283",
		countryFlag: "https://flagcdn.com/au.svg",
	},
	{
		fullName: "Marie Dupont",
		email: "marie@gmail.com",
		nationality: "France",
		nationalID: "06934233728",
		countryFlag: "https://flagcdn.com/fr.svg",
	},
	{
		fullName: "Ramesh Patel",
		email: "ramesh@gmail.com",
		nationality: "India",
		nationalID: "9875412303",
		countryFlag: "https://flagcdn.com/in.svg",
	},
	{
		fullName: "Fatimah Al-Sayed",
		email: "fatimah@gmail.com",
		nationality: "Kuwait",
		nationalID: "0123456789",
		countryFlag: "https://flagcdn.com/kw.svg",
	},
	{
		fullName: "Nina Williams",
		email: "nina@hotmail.com",
		nationality: "South Africa",
		nationalID: "2345678901",
		countryFlag: "https://flagcdn.com/za.svg",
	},
	{
		fullName: "Taro Tanaka",
		email: "taro@gmail.com",
		nationality: "Japan",
		nationalID: "3456789012",
		countryFlag: "https://flagcdn.com/jp.svg",
	},
	{
		fullName: "Abdul Rahman",
		email: "abdul@gmail.com",
		nationality: "Saudi Arabia",
		nationalID: "4567890123",
		countryFlag: "https://flagcdn.com/sa.svg",
	},
	{
		fullName: "Julie Nguyen",
		email: "julie@gmail.com",
		nationality: "Vietnam",
		nationalID: "5678901234",
		countryFlag: "https://flagcdn.com/vn.svg",
	},
];

const bookingsData = [
	// CABIN 001
	{ created_at: fromToday(-20, true), startDate: fromToday(0), endDate: fromToday(7), cabinId: 1, guestId: 2, hasBreakfast: true, observations: "I have a gluten allergy.", isPaid: false, numGuests: 1 },
	{ created_at: fromToday(-33, true), startDate: fromToday(-23), endDate: fromToday(-13), cabinId: 1, guestId: 3, hasBreakfast: true, observations: "", isPaid: true, numGuests: 2 },
	{ created_at: fromToday(-27, true), startDate: fromToday(12), endDate: fromToday(18), cabinId: 1, guestId: 4, hasBreakfast: false, observations: "", isPaid: false, numGuests: 2 },
	// CABIN 002
	{ created_at: fromToday(-45, true), startDate: fromToday(-45), endDate: fromToday(-29), cabinId: 2, guestId: 5, hasBreakfast: false, observations: "", isPaid: true, numGuests: 2 },
	{ created_at: fromToday(-2, true), startDate: fromToday(15), endDate: fromToday(18), cabinId: 2, guestId: 6, hasBreakfast: true, observations: "", isPaid: true, numGuests: 2 },
	// CABIN 003
	{ created_at: fromToday(-65, true), startDate: fromToday(-25), endDate: fromToday(-20), cabinId: 3, guestId: 8, hasBreakfast: true, observations: "", isPaid: true, numGuests: 4 },
	{ created_at: fromToday(-2, true), startDate: fromToday(-2), endDate: fromToday(0), cabinId: 3, guestId: 9, hasBreakfast: false, observations: "Bringing our small dog", isPaid: true, numGuests: 3 },
	// CABIN 004
	{ created_at: fromToday(-30, true), startDate: fromToday(-4), endDate: fromToday(8), cabinId: 4, guestId: 11, hasBreakfast: true, observations: "", isPaid: true, numGuests: 4 },
	{ created_at: fromToday(-1, true), startDate: fromToday(12), endDate: fromToday(17), cabinId: 4, guestId: 12, hasBreakfast: true, observations: "", isPaid: false, numGuests: 4 },
	// CABIN 005
	{ created_at: fromToday(0, true), startDate: fromToday(14), endDate: fromToday(21), cabinId: 5, guestId: 14, hasBreakfast: true, observations: "", isPaid: false, numGuests: 5 },
	{ created_at: fromToday(-6, true), startDate: fromToday(-6), endDate: fromToday(-4), cabinId: 5, guestId: 15, hasBreakfast: true, observations: "", isPaid: true, numGuests: 4 },
	// CABIN 006
	{ created_at: fromToday(-3, true), startDate: fromToday(0), endDate: fromToday(11), cabinId: 6, guestId: 17, hasBreakfast: false, observations: "Late check-in around midnight", isPaid: true, numGuests: 6 },
	{ created_at: fromToday(-16, true), startDate: fromToday(-16), endDate: fromToday(-9), cabinId: 6, guestId: 18, hasBreakfast: true, observations: "", isPaid: true, numGuests: 4 },
	// CABIN 007
	{ created_at: fromToday(-2, true), startDate: fromToday(17), endDate: fromToday(23), cabinId: 7, guestId: 20, hasBreakfast: false, observations: "", isPaid: false, numGuests: 8 },
	// CABIN 008
	{ created_at: fromToday(-8, true), startDate: fromToday(-5), endDate: fromToday(0), cabinId: 8, guestId: 1, hasBreakfast: true, observations: "Gluten-free breakfast needed", isPaid: true, numGuests: 9 },
	{ created_at: fromToday(0, true), startDate: fromToday(0), endDate: fromToday(5), cabinId: 8, guestId: 23, hasBreakfast: true, observations: "Celebrating anniversary", isPaid: true, numGuests: 10 },
];

const defaultSettings = {
	minBookingLength: 3,
	maxBookingLength: 30,
	maxGuestsPerBooking: 10,
	breakfastPrice: 15,
};

// ── 実行 ──────────────────────────────────────────

async function deleteAll() {
	console.log("🗑️  既存データを削除中...");
	// bookings → guests → cabins の順（FK 依存）
	const { error: errBk } = await supabase.from("bookings").delete().gt("id", 0);
	if (errBk) throw new Error(`bookings delete failed: ${errBk.message}`);
	const { error: errGs } = await supabase.from("guests").delete().gt("id", 0);
	if (errGs) throw new Error(`guests delete failed: ${errGs.message}`);
	const { error: errCb } = await supabase.from("cabins").delete().gt("id", 0);
	if (errCb) throw new Error(`cabins delete failed: ${errCb.message}`);
	console.log("   ✅ 削除完了");
}

async function seedCabins() {
	console.log("🏠 客室を作成中...");
	const { error } = await supabase.from("cabins").insert(cabins);
	if (error) throw new Error(`cabins insert failed: ${error.message}`);
	console.log(`   ✅ ${cabins.length} 件作成`);
}

async function seedGuests() {
	console.log("👤 ゲストを作成中...");
	const { error } = await supabase.from("guests").insert(guests);
	if (error) throw new Error(`guests insert failed: ${error.message}`);
	console.log(`   ✅ ${guests.length} 件作成`);
}

async function seedBookings() {
	console.log("📋 予約を作成中...");

	// 実際の DB ID を取得（insert 順でマッピング）
	const { data: guestRows, error: guestError } = await supabase
		.from("guests")
		.select("id")
		.order("id");
	if (guestError) throw new Error(`Failed to fetch guest IDs: ${guestError.message}`);

	const { data: cabinRows, error: cabinError } = await supabase
		.from("cabins")
		.select("id")
		.order("id");
	if (cabinError) throw new Error(`Failed to fetch cabin IDs: ${cabinError.message}`);

	if (!guestRows || !cabinRows) throw new Error("Failed to fetch IDs");

	const guestIds = guestRows.map((r) => r.id);
	const cabinIds = cabinRows.map((r) => r.id);

	const finalBookings = bookingsData.map((b) => {
		const cabin = cabins[b.cabinId - 1];
		const numNights = subtractDates(b.endDate, b.startDate);
		const cabinPrice = numNights * (cabin.regularPrice - cabin.discount);
		const extrasPrice = b.hasBreakfast
			? numNights * defaultSettings.breakfastPrice * b.numGuests
			: 0;
		const totalPrice = cabinPrice + extrasPrice;

		let status: "unconfirmed" | "checked-in" | "checked-out";
		if (isPast(new Date(b.endDate)) && !isToday(new Date(b.endDate)))
			status = "checked-out";
		else if (isFuture(new Date(b.startDate)) || isToday(new Date(b.startDate)))
			status = "unconfirmed";
		else status = "checked-in";

		return {
			...b,
			numNights,
			cabinPrice,
			extrasPrice,
			totalPrice,
			status,
			guestId: guestIds[b.guestId - 1],
			cabinId: cabinIds[b.cabinId - 1],
		};
	});

	const { error } = await supabase.from("bookings").insert(finalBookings);
	if (error) throw new Error(`bookings insert failed: ${error.message}`);
	console.log(`   ✅ ${finalBookings.length} 件作成`);
}

async function seedSettings() {
	console.log("⚙️  設定を作成中...");
	// upsert — 既存設定があれば更新、なければ作成
	const { data: existing } = await supabase
		.from("settings")
		.select("id")
		.limit(1);

	if (existing && existing.length > 0) {
		const { error } = await supabase
			.from("settings")
			.update(defaultSettings)
			.eq("id", existing[0].id);
		if (error) throw new Error(`settings update failed: ${error.message}`);
		console.log("   ✅ 既存設定を更新");
	} else {
		const { error } = await supabase
			.from("settings")
			.insert([defaultSettings]);
		if (error) throw new Error(`settings insert failed: ${error.message}`);
		console.log("   ✅ 新規設定を作成");
	}
}

async function main() {
	console.log("\n🌱 E2E テスト用シードデータ注入開始\n");

	try {
		await deleteAll();
		await seedGuests();
		await seedCabins();
		await seedBookings();
		await seedSettings();

		console.log("\n✅ シードデータ注入完了!\n");
		console.log("📊 サマリー:");
		console.log(`   - 客室: ${cabins.length} 件`);
		console.log(`   - ゲスト: ${guests.length} 件`);
		console.log(`   - 予約: ${bookingsData.length} 件`);
		console.log(`   - 設定: 1 件`);
	} catch (err) {
		console.error("\n❌ シードデータ注入に失敗:", err);
		process.exit(1);
	}
}

main();
