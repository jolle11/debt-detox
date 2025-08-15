import { ListIcon, XIcon } from "@phosphor-icons/react";

interface MobileMenuButtonProps {
	isOpen: boolean;
	onClick: () => void;
}

export default function MobileMenuButton({ isOpen, onClick }: MobileMenuButtonProps) {
	return (
		<div className="flex-none md:hidden">
			<button
				className="btn btn-square btn-ghost"
				onClick={onClick}
			>
				{isOpen ? (
					<XIcon className="h-6 w-6" />
				) : (
					<ListIcon className="h-6 w-6" />
				)}
			</button>
		</div>
	);
}