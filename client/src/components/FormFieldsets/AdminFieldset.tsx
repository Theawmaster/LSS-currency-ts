import { Field, ErrorMessage } from "formik";

import { NewUser } from "../../@types/user";

type Props = {
  user: NewUser;
  handleChange: any;
};

const AdminFieldSet = ({ user, handleChange }: Props) => {
  return (
    <div className="flex items-center justify-center">
      <fieldset>
        <label className="w-2/4">
          <div className="w-3/4">
            Display Name:
            <Field
              type="text"
              id="displayName"
              name="displayName"
              className="input-text input input-bordered input-primary w-full max-w-xs"
              value={user.displayName}
              onChange={handleChange}
            />
            <div className="error-message text-error">
              <ErrorMessage name="displayName" />
            </div>
          </div>
        </label>
      </fieldset>
    </div>
  );
};

export default AdminFieldSet;
