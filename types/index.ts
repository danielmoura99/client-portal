import { Evaluation } from "@prisma/client";

// types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  zipCode?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EvaluationsResponse {
  evaluations: Evaluation[];
  message?: string;
}

export type RequestStatus = "PENDING" | "IN_ANALYSIS" | "COMPLETED";

export const REQUEST_STATUS = {
  PENDING: "PENDING",
  IN_ANALYSIS: "IN_ANALYSIS",
  COMPLETED: "COMPLETED",
} as const;
