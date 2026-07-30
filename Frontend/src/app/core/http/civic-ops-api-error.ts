import { HttpErrorResponse } from '@angular/common/http';
import { ProblemDetails } from './problem-details';

export class CivicOpsApiError extends Error {
  constructor(
    readonly status: number,
    readonly problem: ProblemDetails,
  ) {
    super(
      problem.detail ??
        problem.title ??
        'Não foi possível concluir a comunicação com a API.',
    );
  }
}

export function toCivicOpsApiError(error: HttpErrorResponse): CivicOpsApiError {
  const problem =
    error.error && typeof error.error === 'object'
      ? (error.error as ProblemDetails)
      : {};

  return new CivicOpsApiError(error.status, problem);
}
