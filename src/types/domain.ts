/**
 * ドメインモデル型定義
 * Supabase テーブル Row 型から派生したアプリケーション層の型
 */

import type { Database } from "./supabase";

// ────────────────────────────────────────────
// テーブル Row 型のエイリアス
// ────────────────────────────────────────────

export type Cabin = Database["public"]["Tables"]["cabins"]["Row"];
export type CabinInsert = Database["public"]["Tables"]["cabins"]["Insert"];
export type CabinUpdate = Database["public"]["Tables"]["cabins"]["Update"];

export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"];
export type BookingUpdate = Database["public"]["Tables"]["bookings"]["Update"];

export type Guest = Database["public"]["Tables"]["guests"]["Row"];
export type GuestInsert = Database["public"]["Tables"]["guests"]["Insert"];

export type Settings = Database["public"]["Tables"]["settings"]["Row"];
export type SettingsUpdate = Database["public"]["Tables"]["settings"]["Update"];

// ────────────────────────────────────────────
// ステータス
// ────────────────────────────────────────────

export type BookingStatus = Booking["status"];

// ────────────────────────────────────────────
// リレーション付きの拡張型 (API レスポンス用)
// ────────────────────────────────────────────

/**
 * 予約一覧で使用 — cabins.name と guests.fullName/email のみ
 * NOTE: プロパティ名 cabins / guests は複数形だが、Supabase の
 * JOIN（embedding）仕様により実際には単一オブジェクトが返される。
 */
export interface BookingWithSummary extends Booking {
	cabins: { name: string };
	guests: { fullName: string; email: string };
}

/**
 * 予約詳細で使用 — 全 cabin/guest フィールドを含む
 * NOTE: cabins / guests は Supabase JOIN により単一オブジェクト。
 */
export interface BookingWithDetails extends Booking {
	cabins: Cabin;
	guests: Guest;
}

/** 今日のアクティビティで使用 */
export interface BookingWithGuestInfo extends Booking {
	guests: Pick<Guest, "fullName" | "nationality" | "countryFlag">;
}

/** ダッシュボード — 売上集計用 */
export interface BookingAfterDate {
	created_at: string;
	totalPrice: number;
	extrasPrice: number;
}

/** ダッシュボード — 滞在集計用 */
export interface StayAfterDate extends Booking {
	guests: Pick<Guest, "fullName">;
}

// ────────────────────────────────────────────
// フォーム入力型 (react-hook-form 用)
// ────────────────────────────────────────────

/**
 * react-hook-form のフォーム入力型。
 * image は File | string — フォームの FileInput から取得した File、
 * または既存の画像 URL 文字列。onSubmit 内で image[0] を抽出してから
 * CreateEditCabinData に渡す。
 */
export interface CreateCabinFormData {
	name: string;
	maxCapacity: number;
	regularPrice: number;
	discount: number;
	description: string;
	image: File | FileList | string;
}

export interface SignupFormData {
	fullName: string;
	email: string;
	password: string;
	passwordConfirm: string;
}

export interface LoginFormData {
	email: string;
	password: string;
}

export interface UpdatePasswordFormData {
	password: string;
	passwordConfirm: string;
}

export interface UpdateUserData {
	password?: string;
	fullName?: string;
	avatar?: File | null;
}
