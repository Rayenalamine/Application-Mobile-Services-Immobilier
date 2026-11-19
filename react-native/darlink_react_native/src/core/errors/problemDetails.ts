// ============================================================
// DARLINK — RFC 9457 PROBLEM DETAILS (React Native)
// ============================================================

export interface InvalidParam {
  name: string;
  reason: string;
}

export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  invalidParams?: InvalidParam[];
  timestamp?: string;
}

export class ApiException extends Error {
  public problem: ProblemDetail;

  constructor(problem: ProblemDetail) {
    super(problem.detail || problem.title || 'Une erreur est survenue');
    this.name = 'ApiException';
    this.problem = problem;
  }
}

