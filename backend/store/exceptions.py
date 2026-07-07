from rest_framework.views import exception_handler
from rest_framework.exceptions import ValidationError, AuthenticationFailed, PermissionDenied, NotFound


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None:
        return response

    message = 'Something went wrong'

    if isinstance(exc, ValidationError):
        detail = exc.detail
        if isinstance(detail, dict):
            messages = []
            for field, errors in detail.items():
                if isinstance(errors, list):
                    messages.extend([str(e) for e in errors])
                else:
                    messages.append(str(errors))
            message = ', '.join(messages)
        elif isinstance(detail, list):
            message = ', '.join([str(e) for e in detail])
        else:
            message = str(detail)
    elif isinstance(exc, (AuthenticationFailed, PermissionDenied, NotFound)):
        message = str(exc.detail)
    elif hasattr(exc, 'detail'):
        message = str(exc.detail)

    response.data = {'success': False, 'message': message}
    return response
