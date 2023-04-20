import { useState, useEffect } from 'react';
import dayjs from "dayjs";
import { Training } from "../../../@types/training"

export type TrainingListProps = {
  trainings: Training[];
  setTrainings: React.Dispatch<React.SetStateAction<Training[]>>;
}


export default function TrainingList({ trainings, setTrainings}: TrainingListProps): JSX.Element {
    return (
        <>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Requirement</th>
                        <th>Capacity</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th colSpan={2}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {trainings.map((training: Training) => {
                        return (
                            <tr key={training.id}>
                                <td>{training.id}</td>
                                <td>{training.requirements.name}</td>
                                <td>{training.capacity - training.trainees.length}/{training.capacity}</td>
                                <td>{dayjs(training.start).format("YYYY-MM-DD, HH:mm a")}</td>
                                <td>{dayjs(training.end).format("YYYY-MM-DD, HH:mm a")}</td>
                                <td><button>👀</button></td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </>
    )
}