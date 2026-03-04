/**
 * 共通型定義
 * API パラメータ、UI コンポーネント Props 等で横断的に使用
 */

import type { ReactNode } from "react";

// ────────────────────────────────────────────
// API パラメータ
// ────────────────────────────────────────────

export type FilterMethod = "eq" | "gte" | "lte" | "neq";

export interface Filter {
	field: string;
	value: string;
	method?: FilterMethod;
}

export interface SortBy {
	field: string;
	direction: "asc" | "desc";
}

// ────────────────────────────────────────────
// 汎用 Props
// ────────────────────────────────────────────

export interface ChildrenProps {
	children: ReactNode;
}

// ────────────────────────────────────────────
// ページネーション
// ────────────────────────────────────────────

export interface PaginatedResult<T> {
	data: T[];
	count: number;
}

