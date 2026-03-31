import type { UseFormRegisterReturn } from "react-hook-form";

interface FormInputProps {
	label: string;
	type?: "text" | "password" | "email" | "number" | "date";
	value?: string;
	onChange?: (value: string) => void;
	placeholder?: string;
	required?: boolean;
	className?: string;
	error?: string;
	registration?: UseFormRegisterReturn;
	disabled?: boolean;
	step?: string;
	min?: string;
	max?: string;
}

export default function FormInput({
	label,
	type = "text",
	value,
	onChange,
	placeholder,
	required = false,
	className = "",
	error,
	registration,
	disabled,
	step,
	min,
	max,
}: FormInputProps) {
	return (
		<div className="form-control">
			<label className="label pb-2">
				<span className="label-text font-medium">{label}</span>
			</label>
			{registration ? (
				<input
					type={type}
					className={`input input-bordered w-full ${error ? "input-error" : ""} ${className}`}
					placeholder={placeholder}
					disabled={disabled}
					step={step}
					min={min}
					max={max}
					{...registration}
				/>
			) : (
				<input
					type={type}
					className={`input input-bordered w-full ${error ? "input-error" : ""} ${className}`}
					value={value}
					onChange={(e) => onChange?.(e.target.value)}
					placeholder={placeholder}
					required={required}
					disabled={disabled}
					step={step}
					min={min}
					max={max}
				/>
			)}
			{error && (
				<label className="label py-1">
					<span className="label-text-alt text-error">{error}</span>
				</label>
			)}
		</div>
	);
}
