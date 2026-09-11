import type { ReactNode } from "react";

type IconProps = { className?: string };

function base(path: ReactNode, props: IconProps) {
	return (
		<svg
			className={props.className ?? "size-5"}
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.8}
			stroke="currentColor"
			aria-hidden="true"
		>
			{path}
		</svg>
	);
}

export function FolderIcon(props: IconProps) {
	return base(
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M3.75 7.5a1.5 1.5 0 0 1 1.5-1.5h4.19a1.5 1.5 0 0 1 1.06.44l1.5 1.5a1.5 1.5 0 0 0 1.06.44h6.19a1.5 1.5 0 0 1 1.5 1.5v8.62a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V7.5Z"
		/>,
		props,
	);
}

export function FileIcon(props: IconProps) {
	return base(
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M9 12.75h6m-6 3h6m-9 3.75h12a1.5 1.5 0 0 0 1.5-1.5V7.06a1.5 1.5 0 0 0-.44-1.06l-3.56-3.56a1.5 1.5 0 0 0-1.06-.44H6a1.5 1.5 0 0 0-1.5 1.5v13.5a1.5 1.5 0 0 0 1.5 1.5Z"
		/>,
		props,
	);
}

export function SearchIcon(props: IconProps) {
	return base(
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="m21 21-5.2-5.2m0 0a7.2 7.2 0 1 0-10.18 0 7.2 7.2 0 0 0 10.18 0Z"
		/>,
		props,
	);
}

export function PlusIcon(props: IconProps) {
	return base(
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M12 4.5v15m7.5-7.5h-15"
		/>,
		props,
	);
}

export function ChevronRightIcon(props: IconProps) {
	return base(
		<path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />,
		props,
	);
}

export function DotsVerticalIcon(props: IconProps) {
	return base(
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M12 6.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 6.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 6.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
		/>,
		props,
	);
}

export function GridIcon(props: IconProps) {
	return base(
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M3.75 4.5h6v6h-6v-6Zm10.5 0h6v6h-6v-6Zm-10.5 10.5h6v6h-6v-6Zm10.5 0h6v6h-6v-6Z"
		/>,
		props,
	);
}

export function ListIcon(props: IconProps) {
	return base(
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M3.75 6h16.5M3.75 12h16.5M3.75 18h16.5"
		/>,
		props,
	);
}

export function UploadIcon(props: IconProps) {
	return base(
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M3 16.5v1.5a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18v-1.5M7.5 8.25 12 3.75m0 0 4.5 4.5M12 3.75v12.75"
		/>,
		props,
	);
}

export function DownloadIcon(props: IconProps) {
	return base(
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M3 16.5v1.5a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 18v-1.5M7.5 12l4.5 4.5m0 0 4.5-4.5m-4.5 4.5V3.75"
		/>,
		props,
	);
}

export function PencilIcon(props: IconProps) {
	return base(
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="m16.86 4.487 2.652 2.652m-2.652-2.652L6.75 14.65a2.25 2.25 0 0 0-.596 1.023l-.752 3.11 3.11-.752c.39-.094.746-.294 1.023-.596L19.5 7.14m-2.64-2.652a1.875 1.875 0 1 1 2.652 2.652"
		/>,
		props,
	);
}

export function MoveIcon(props: IconProps) {
	return base(
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M8.25 15 3 9.75 8.25 4.5M3 9.75h11.25A5.25 5.25 0 0 1 19.5 15v.75"
		/>,
		props,
	);
}

export function TrashIcon(props: IconProps) {
	return base(
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
		/>,
		props,
	);
}

export function XIcon(props: IconProps) {
	return base(
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M6 18 18 6M6 6l12 12"
		/>,
		props,
	);
}

export function LogoutIcon(props: IconProps) {
	return base(
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 -3h12m0 0-3-3m3 3-3 3"
		/>,
		props,
	);
}

export function SunIcon(props: IconProps) {
	return base(
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M12 3v1.5m0 15V21m8.25-9H21M3 12h1.5m14.03-6.53-1.06 1.06M6.53 17.47l-1.06 1.06m0-13.06 1.06 1.06m10.94 10.94 1.06 1.06M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"
		/>,
		props,
	);
}

export function MoonIcon(props: IconProps) {
	return base(
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
		/>,
		props,
	);
}

export function ComputerIcon(props: IconProps) {
	return base(
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m-13.5-6h21m-19.5 0h18A1.5 1.5 0 0 0 21 9.75v-5.25a1.5 1.5 0 0 0-1.5-1.5H4.5A1.5 1.5 0 0 0 3 4.5v5.25a1.5 1.5 0 0 0 1.5 1.5Z"
		/>,
		props,
	);
}

export function ClockIcon(props: IconProps) {
	return base(
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z"
		/>,
		props,
	);
}

export function UserIcon(props: IconProps) {
	return base(
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.964 0a9 9 0 1 0-11.964 0m11.964 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
		/>,
		props,
	);
}
