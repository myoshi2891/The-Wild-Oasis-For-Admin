/**
 * Supabase Database 型定義
 * design.md の ER 図に基づく手動定義
 */

export interface Database {
	public: {
		Tables: {
			cabins: {
				Row: {
					id: number;
					created_at: string;
					name: string;
					maxCapacity: number;
					regularPrice: number;
					discount: number;
					description: string;
					image: string;
				};
				Insert: Omit<Database["public"]["Tables"]["cabins"]["Row"], "id" | "created_at"> & {
					id?: number;
					created_at?: string;
				};
				Update: Partial<Database["public"]["Tables"]["cabins"]["Insert"]>;
			};
			bookings: {
				Row: {
					id: number;
					created_at: string;
					startDate: string;
					endDate: string;
					numNights: number;
					numGuests: number;
					cabinPrice: number;
					extrasPrice: number;
					totalPrice: number;
					status: "unconfirmed" | "checked-in" | "checked-out";
					hasBreakfast: boolean;
					isPaid: boolean;
					observations: string;
					cabinId: number;
					guestId: number;
				};
				Insert: Omit<Database["public"]["Tables"]["bookings"]["Row"], "id" | "created_at"> & {
					id?: number;
					created_at?: string;
				};
				Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
			};
			guests: {
				Row: {
					id: number;
					created_at: string;
					fullName: string;
					email: string;
					nationality: string;
					nationalID: string;
					countryFlag: string;
				};
				Insert: Omit<Database["public"]["Tables"]["guests"]["Row"], "id" | "created_at"> & {
					id?: number;
					created_at?: string;
				};
				Update: Partial<Database["public"]["Tables"]["guests"]["Insert"]>;
			};
			settings: {
				Row: {
					id: number;
					created_at: string;
					minBookingLength: number;
					maxBookingLength: number;
					maxGuestsPerBooking: number;
					breakfastPrice: number;
				};
				Insert: Omit<Database["public"]["Tables"]["settings"]["Row"], "id" | "created_at"> & {
					id?: number;
					created_at?: string;
				};
				Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
			};
		};
	};
}
