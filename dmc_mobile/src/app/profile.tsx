import { useProfileController } from "../controllers/profilecontroller";
import { ProfileView } from "../views/profileview";

export default function Profile() {
    const controller = useProfileController();

    return <ProfileView {...controller} />;
}