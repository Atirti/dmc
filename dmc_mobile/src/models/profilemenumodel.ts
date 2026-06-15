export type ProfileMenuAction = "settings" | "logout" | "logoutAll";

export type ProfileMenuItem = {
    action: ProfileMenuAction;
    label: string;
    destructive?: boolean;
    bold?: boolean;
};

export function getProfileMenuItems(
    isAuthenticated: boolean
): ProfileMenuItem[] {
    if (!isAuthenticated) {
        return [
            {
                action: "settings",
                label: "Настройки",
            },
        ];
    }

    return [
        {
            action: "settings",
            label: "Настройки",
        },
        {
            action: "logout",
            label: "Выход",
            destructive: true,
        },
        {
            action: "logoutAll",
            label: "Выход со всех аккаунтов",
            destructive: true,
            bold: true,
        },
    ];
}