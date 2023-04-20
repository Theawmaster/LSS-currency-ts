import { Link } from "react-router-dom";

export default function CreateTrainingButton(): JSX.Element {
  return (
      <Link to={`/trainings/new`}>
        <button style={{ backgroundColor: "#00A0A0" }}>➕ Training</button>
      </Link>
  );
}
