from string import ascii_letters, ascii_lowercase, ascii_uppercase, digits, punctuation

from pydantic import ValidationInfo


AUTH_ALLOWED_CHARS = ascii_letters + digits + punctuation
SORT_FIELDS = {"date", "price"}
SORT_ORDERS = {"asc", "desc"}


def _field_label(info: ValidationInfo, default: str = "Value") -> str:
    field_name = getattr(info, "field_name", None)
    if field_name is None:
        return default
    return field_name.replace("_", " ").capitalize()


def validate_non_empty_string(value: str, info: ValidationInfo) -> str:
    if value.strip() == "":
        raise ValueError(f"{_field_label(info)} cannot be empty")
    return value


def validate_optional_non_empty_string(value: str | None, info: ValidationInfo) -> str | None:
    if value is None:
        return value
    return validate_non_empty_string(value, info)


def validate_auth_content(value: str, info: ValidationInfo) -> str:
    for ch in value:
        if ch not in AUTH_ALLOWED_CHARS:
            raise ValueError(f"{info.field_name} must contain only eng letters, numbers, and/or punctuation")
    return value


def validate_username(value: str) -> str:
    if len(value) < 4:
        raise ValueError("Username must be at least 4 characters")
    if len(value) > 50:
        raise ValueError("Username should be no more than 50 characters")
    return value


def validate_password(value: str) -> str:
    if len(value) < 8:
        raise ValueError("Password must be at least 8 characters")

    has_lower = False
    has_upper = False
    has_digit = False
    has_punctuation = False

    for ch in value:
        if ch in ascii_lowercase:
            has_lower = True
        if ch in ascii_uppercase:
            has_upper = True
        if ch in digits:
            has_digit = True
        if ch in punctuation:
            has_punctuation = True

    if not (has_lower and has_upper and has_digit and has_punctuation):
        raise ValueError("Password must contains lower and upper case letters, digits and punctuation")
    return value


def validate_positive_int(value: int, info: ValidationInfo) -> int:
    if value < 1:
        raise ValueError(f"{_field_label(info)} must be >= 1")
    return value


def validate_optional_positive_int(value: int | None, info: ValidationInfo) -> int | None:
    if value is None:
        return value
    return validate_positive_int(value, info)


def validate_non_negative_int(value: int, info: ValidationInfo) -> int:
    if value < 0:
        raise ValueError(f"{_field_label(info)} must be >= 0")
    return value


def validate_optional_non_negative_int(value: int | None, info: ValidationInfo) -> int | None:
    if value is None:
        return value
    return validate_non_negative_int(value, info)


def validate_non_negative_number(value: int | float, info: ValidationInfo) -> int | float:
    if value < 0:
        raise ValueError(f"{_field_label(info)} must be >= 0")
    return value


def validate_optional_non_negative_number(value: int | float | None, info: ValidationInfo) -> int | float | None:
    if value is None:
        return value
    return validate_non_negative_number(value, info)


def validate_limit(value: int) -> int:
    if value < 1:
        raise ValueError("Limit must be >= 1")
    if value > 500:
        raise ValueError("Limit must be <= 500")
    return value


def validate_sort(value: str) -> str:
    if value not in SORT_FIELDS:
        raise ValueError("Sort must be 'date' or 'price'")
    return value


def validate_order(value: str) -> str:
    if value not in SORT_ORDERS:
        raise ValueError("Order must be 'asc' or 'desc'")
    return value
