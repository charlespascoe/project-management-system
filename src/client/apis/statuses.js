export function defaultStatus(statusCode) {
  if (statusCode >= 200 && statusCode < 300) {
    return new SuccessStatus();
  }

  switch (statusCode) {
    case -1:
      return new RequestFailedStatus();
    case 400:
      return new BadRequestStatus();
    case 401:
      return new UnauthenticatedStatus();
    case 403:
      return new UnauthorisedStatus();
    case
  }
}

export class Status { }

export class SuccessStatus extends Status { }

export class ErrorStatus extends Status { }

export class UnauthenticatedStatus extends ErrorStatus { }

export class UnauthorisedStatus extends ErrorStatus { }

export class UnknownErrorStatus extends ErrorStatus { }

export class FatalErrorStatus extends ErrorStatus { }

export class RequestFailedStatus extends FatalErrorStatus { }

export class BadRequestStatus extends FatalErrorStatus { }

export class ServerErrorStatus extends FatalErrorStatus { }
