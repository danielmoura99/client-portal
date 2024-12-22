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
