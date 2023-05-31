import { Link } from "react-router-dom";
import { useContext } from "react";
import { User } from "../../../@types/user";
import Edit from "../../../assets/icons/editIcon.svg";
import { CurrentUserContext } from "../../../App";
export default function EditUserButton({ user }: { user: User }): JSX.Element {
  const currentUser = useContext(CurrentUserContext);

  return currentUser?.id !== user.id ? (
    <Link to={`/users/${user.id}/edit`}>
      <button className="btn btn-circle btn-outline">
        <img src={Edit} alt="edit" />
      </button>
    </Link>
  ) : (
    <> </>
  );
}
