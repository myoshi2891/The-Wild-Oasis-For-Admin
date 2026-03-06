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
				Insert: {
					id?: number;
					created_at?: string;
					name: string;
					maxCapacity: number;
					regularPrice: number;
					discount: number;
					description: string;
					image: string;
				};
				Update: {
					id?: number;
					created_at?: string;
					name?: string;
					maxCapacity?: number;
					regularPrice?: number;
					discount?: number;
					description?: string;
					image?: string;
				};
				Relationships: [];
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
				Insert: {
					id?: number;
					created_at?: string;
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
				Update: {
					id?: number;
					created_at?: string;
					startDate?: string;
					endDate?: string;
					numNights?: number;
					numGuests?: number;
					cabinPrice?: number;
					extrasPrice?: number;
					totalPrice?: number;
					status?: "unconfirmed" | "checked-in" | "checked-out";
					hasBreakfast?: boolean;
					isPaid?: boolean;
					observations?: string;
					cabinId?: number;
					guestId?: number;
				};
				Relationships: [];
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
				Insert: {
					id?: number;
					created_at?: string;
					fullName: string;
					email: string;
					nationality: string;
					nationalID: string;
					countryFlag: string;
				};
				Update: {
					id?: number;
					created_at?: string;
					fullName?: string;
					email?: string;
					nationality?: string;
					nationalID?: string;
					countryFlag?: string;
				};
				Relationships: [];
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
				Insert: {
					id?: number;
					created_at?: string;
					minBookingLength: number;
					maxBookingLength: number;
					maxGuestsPerBooking: number;
					breakfastPrice: number;
				};
				Update: {
					id?: number;
					created_at?: string;
					minBookingLength?: number;
					maxBookingLength?: number;
					maxGuestsPerBooking?: number;
					breakfastPrice?: number;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
}
