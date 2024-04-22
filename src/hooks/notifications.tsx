import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { hasStringContent, formatErrMsg } from "@/utils";

const DEFAULT_ID = "default-id";

export const notifShow = (title: string, msg = "", id = DEFAULT_ID) => {
	notifications.show({
		id: id,
		loading: true,
		title: title,
		message: msg,
		autoClose: false,
		withCloseButton: false,
	});
};

export const notifSuccess = (title?: string, msg = "", id = DEFAULT_ID) => {
	notifications.update({
		id: id,
		loading: false,
		title: hasStringContent(title) ? title : "Sucess",
		message: msg,
		color: "green",
		icon: <IconCheck />,
		autoClose: 2000,
		withCloseButton: true,
	});
};

export const notifError = (title?: string, msg?: string, id = DEFAULT_ID) => {
	notifications.update({
		id: id,
		loading: false,
		title: hasStringContent(title) ? title : "Some error occured",
		message: formatErrMsg(hasStringContent(msg) ? msg : "Please try again."),
		color: "red",
		icon: <IconX />,
		// autoClose: 3000,
		withCloseButton: true,
	});
};

export const notifHide = (id = DEFAULT_ID) => {
	notifications.hide(id);
};
