import { useState, useEffect} from "react";
import { useParams, useNavigate} from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Training } from "../../../@types/training";
import { SimpleLookup } from "../../../@types/lookup";
import getRequest from "../../../utilities/getRequest";
import putRequest from "../../../utilities/putRequest";
import dayjs from "dayjs";
export default function EditTrainingForm(): JSX.Element {
    const navigate = useNavigate();
    const { id } = useParams();
    const [requirementTypes, setRequirementTypes] = useState<SimpleLookup[]>([])
    const [training, setTraining] = useState<Training>({ 
        id: 0,
        capacity: 0,
        start: new Date(),
        end: new Date(),
        complete: false,
        requirement: 0,
        requirements: {
            name: ''
        },
        instruction: "",
        trainees: [
            {
                trainees: {
                    callsign: '',
                    categories: {
                        name: '',
                    },
                    currencies: {
                        expiry: new Date()
                    }
                }
            },   
        ]
    });

    
    useEffect(() => {
        getRequest(`/api/trainings/${id}`, setTraining);
    }, [id, setTraining]);

    useEffect(() => {
        getRequest(`/api/lookup/requirements`, setRequirementTypes);
    }, [])

    const handleFormSubmit = async () => {
        await putRequest(`/api/trainings/${id}`, training, setTraining);
        navigate(`/trainings`);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setTraining(training => {
            if (name === 'requirement') {
            return {
                ...training,
                requirement: requirementTypes.find((type) => (value === type.name))?.id ?? 0,
            };
            } else if (name === 'start') {
                const newStart = dayjs(value).toDate();
                return { ...training, start: newStart }
            } else if (name === 'end') {
                const newEnd = dayjs(value).toDate();
                return { ...training, end: newEnd }
            } else if (name === 'start_time') {
                const [hours, minutes] = value.split(':');
                const newStart = dayjs(training.start).set('hour', parseInt(hours)).set('minute', parseInt(minutes)).toDate();
                return { ...training, start: newStart }
            } else if (name === 'end_time') {
                const [hours, minutes] = value.split(':');
                const newEnd = dayjs(training.end).set('hour', parseInt(hours)).set('minute', parseInt(minutes)).toDate();
                return { ...training, end: newEnd }
            } else {
                return {
                    ...training,
                    [name]: (name==="capacity") ? Number(value) : value
                };
            }
        });
    };

  return (
    <fieldset>
        <div className="max-w-lg mx-auto"></div>
        <h1 className="text-3xl text-center font-bold mb-8">Edit {training?.requirements?.name} on {dayjs(training?.start).format("YYYY-MM-DD")}</h1>
        <div className="flex items-center justify-center">
            <Formik initialValues={training} onSubmit={handleFormSubmit}>
            {({ isSubmitting, isValidating, isValid }) => (
                <Form className="space-y-6">
                    <div className="flex items-center">
                        <label className="w-2/4">Requirement Type:</label>
                        <div className="w-3/4">
                            <Field
                                as="select"
                                type="text"
                                id="requirement"
                                name="requirement"
                                className="input-select select select-primary w-full max-w-xs"
                                value={requirementTypes.find((type) => (training?.requirement === type.id))?.name || ""}
                                onChange={handleInputChange}
                            >
                                <option value="">Select a requirement</option>
                                {requirementTypes.map((type) => {
                                    return (
                                        <option value={type.name} key ={type.id}>
                                            {type.name}
                                        </option>
                                    )
                                })}
                            </Field>
                            <ErrorMessage name="requirement" className="error-message"/>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <label className="w-2/4">Start Date:</label>
                        <div className="w-3/4">
                            <Field
                                type="date"
                                id="start"
                                name="start"
                                value={dayjs(training?.start).format("YYYY-MM-DD") || ""}
                                className="input-text input input-bordered input-primary w-full max-w-xs"
                                onChange={handleInputChange}
                            />
                            <ErrorMessage name="start_date" className="error-message"/>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <label className="w-2/4">Start Time:</label>
                        <div className="w-3/4">
                            <Field
                                type="time"
                                id="start_time"
                                name="start_time"
                                value={dayjs(training?.start).format("HH:mm") || ""}
                                className="input-text input input-bordered input-primary w-full max-w-xs"
                                onChange={handleInputChange}
                            />
                            <ErrorMessage name="start_time" className="error-message"/>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <label className="w-2/4">End Date:</label>
                        <div className="w-3/4">
                            <Field
                                type="date"
                                id="end"
                                name="end"
                                value={dayjs(training?.end).format("YYYY-MM-DD") || ""}
                                className="input-text input input-bordered input-primary w-full max-w-xs"
                                onChange={handleInputChange}
                            />
                            <ErrorMessage name="start_date" className="error-message"/>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <label className="w-2/4">End Time:</label>
                        <div className="w-3/4">
                            <Field
                                type="time"
                                id="end_time"
                                name="end_time"
                                value={dayjs(training?.end).format("HH:mm") || ""}
                                className="input-text input input-bordered input-primary w-full max-w-xs"
                                onChange={handleInputChange}
                            />
                            <ErrorMessage name="end_time" className="error-message"/>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <label className="w-2/4">Capacity:</label>
                        <div className="w-3/4">
                            <Field
                            type="number"
                            id="capacity"
                            name="capacity"
                            value={training?.capacity || ""}
                            className="input-text input input-bordered input-primary w-full max-w-xs"
                            onChange={handleInputChange}
                            />
                            <ErrorMessage name="capacity" className="error-message"/>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <label className="w-2/4">Additional Instructions:</label>
                        <div className="w-3/4">
                            <Field
                            as="textarea"
                            type="text"
                            id="instruction"
                            name="instruction"
                            value={training?.instruction || ""}
                            className="textarea textarea-primary"
                            onChange={handleInputChange}
                            />
                            <ErrorMessage name="instruction" className="error-message"/>
                        </div>
                    </div>
                <div className="flex justify-center">
                    <button
                    type="submit"
                    disabled={isSubmitting || isValidating || !isValid}
                    className="btn btn-info "
                    >
                    Update Training
                    </button>
                </div>
                </Form>
            )}
            </Formik>
        </div>
    </fieldset>
  )
}
