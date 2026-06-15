const errorMessages = {
    "Product not found": "Товар не найден",
    "Category not found": "Категория не найдена",
    "Category already exists": "Такая категория уже существует",
    "Category in use": "Нельзя удалить категорию, потому что в ней есть товары",
    "Input values": "Некорректные данные",
    "Orders not found": "Заказы не найдены",
    "Order not found": "Заказ не найден",
    "Invalid or expired refresh token": "Сессия истекла. Войдите снова",
    "Token expired": "Сессия истекла. Войдите снова",
    "Invalid token": "Ошибка авторизации. Войдите снова",
    "Refresh token отсутствует": "Сессия истекла. Войдите снова",
    "Access token отсутствует": "Сессия истекла. Войдите снова",
    "JWT token отсутствует": "Сессия истекла. Войдите снова",
    "Product not found in cart": "Товар не найден в корзине",
    "Not enough product in stock.": "Недостаточно товара на складе",
    "Incorrect username or password": "Неверный логин или пароль",
    "Username already taken": "Такой логин уже занят",
};

function getErrorDetail(error) {
    if (error?.response?.data?.detail) {
        return error.response.data.detail;
    }

    if (error?.data?.detail) {
        return error.data.detail;
    }

    if (error?.detail) {
        return error.detail;
    }

    if (error?.message) {
        return error.message;
    }

    return "";
}

function getErrorStatus(error) {
    return error?.response?.status || error?.status || null;
}

const statusMessages = {
    400: "Некорректный запрос",
    401: "Войдите в аккаунт",
    403: "Недостаточно прав",
    404: "Данные не найдены",
    409: "Конфликт данных",
    422: "Проверьте введенные данные",
    500: "Ошибка сервера",
};

const fieldNames = {username: "Логин", password: "Пароль", title: "Название", description: "Описание", price: "Цена",
    picture_url: "Ссылка на изображение", count_in_stock: "Количество на складе", category_id: "Категория", address: "Адрес",};

const validationErrorMessages = {
    "password must contain only eng letters, numbers, and/or punctuation":
            "используйте только английские буквы, цифры и знаки пунктуации",
    "username must contain only eng letters, numbers, and/or punctuation":
            "используйте только английские буквы, цифры и знаки пунктуации",
    "Field required": "поле обязательно для заполнения",
    "Input should be a valid integer": "должно быть целым числом",
    "Input should be a valid number": "должно быть числом",
    "Input should be a valid string": "должно быть строкой",
};

function getFieldName(field) {
    return fieldNames[field] || field;
}

function getFieldFromPath(fieldPath) {
    return fieldPath.split(".").filter(Boolean).pop() || "";
}

function translateValidationMessage(message) {
    if (!message) {
        return "некорректное значение";
    }

    const cleanedMessage = message
            .replace("Value error, ", "")
            .trim();

    return validationErrorMessages[cleanedMessage] ||
            validationErrorMessages[message] ||
            cleanedMessage;
}

function getValidationErrorMessage(detail) {
    if (Array.isArray(detail)) {
        if (detail.length === 0) {
            return "Некорректные данные";
        }

        return detail.map((error) => {
            const field = Array.isArray(error.loc)
                    ? error.loc[error.loc.length - 1]
                    : "";

            const fieldName = getFieldName(field);
            const message = translateValidationMessage(error.msg);

            return `${fieldName}: ${message}`;
        }).join(". ");
    }

    if (typeof detail === "string" && detail.includes(": Value error,")) {
        const [fieldPath, message] = detail.split(": Value error,");
        const field = getFieldFromPath(fieldPath);
        const fieldName = getFieldName(field);
        const translatedMessage = translateValidationMessage("Value error," + message);

        return `${fieldName}: ${translatedMessage}`;
    }

    if (typeof detail === "string" && detail.includes(":")) {
        const [fieldPath, ...messageParts] = detail.split(":");
        const message = messageParts.join(":").trim();

        if (validationErrorMessages[message]) {
            const field = getFieldFromPath(fieldPath);
            const fieldName = getFieldName(field);

            return `${fieldName}: ${translateValidationMessage(message)}`;
        }
    }

    return null;
}

export function getNormalErrorMessage(error) {
    const detail = getErrorDetail(error);
    const status = getErrorStatus(error);

    const validationMessage = getValidationErrorMessage(detail);
    if (validationMessage) {
        return validationMessage;
    }

    if (typeof detail !== "string") {
        return "Произошла ошибка";
    }

    const normalizedDetail = detail.trim();
    const detailWithoutFinalDot = normalizedDetail.replace(/\.$/, "");

    if (errorMessages[normalizedDetail]) {
        return errorMessages[normalizedDetail];
    }

    if (errorMessages[detailWithoutFinalDot]) {
        return errorMessages[detailWithoutFinalDot];
    }

    const stockMatch = normalizedDetail.match(/^Not enough (.+) in stock\.?$/);
    if (stockMatch) {
        const productTitle = stockMatch[1];

        return `Недостаточно товара «${productTitle}» на складе`;
    }

    if (normalizedDetail.includes("Failed to fetch")) {
        return "Не удалось подключиться к серверу";
    }

    if (normalizedDetail.includes("Network Error")) {
        return "Ошибка соединения с сервером";
    }

    if (statusMessages[status]) {
        return statusMessages[status];
    }

    return normalizedDetail || "Произошла ошибка";
}
