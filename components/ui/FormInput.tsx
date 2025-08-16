interface FormInputProps {
	label: string;
	type?: "text" | "password" | "email";
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	required?: boolean;
	className?: string;
}

export default function FormInput({
	label,
	type = "text",
	value,
	onChange,
	placeholder,
	required = false,
	className = "",
}: FormInputProps) {
	return (
		<div className="form-control">
			<label className="label pb-2">
				<span className="label-text font-medium">{label}</span>
			</label>
			<input
				type={type}
				className={`input input-bordered w-full ${className}`}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				required={required}
			/>
		</div>
	);
}
