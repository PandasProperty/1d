import axios from "axios";
import { notifShow, notifSuccess, notifError } from "@/hooks/notifications";

const api = axios.create({
	// baseURL: "https://all-note-backend.onrender.com/api/v1", // Replace with your actual base URL
	baseURL: "https://test.com", // Replace with your actual base URL
	// // You can add more default settings here
	// headers: {
	//   'Content-Type': 'application/json',
	//   // Authorization: 'Bearer yourTokenHere' // If you need to send a token
	// },
	// timeout: 10000, // Optional: set default timeout for all requests
});

// Request Interceptor
api.interceptors.request.use(
	(config) => {
		// Perform actions before the request is sent
		// // For example, adding an authorization header
		// const token = "your-access-token"; // Replace with logic to retrieve your token
		// if (token) {
		// 	config.headers.Authorization = `Bearer ${token}`;
		// }

		// // You can also add other headers or log the request
		// console.log("Request:", config);

		notifShow("Sending");

		// Always return config or the request will be stopped here
		return config;
	},
	(error) => {
		// Do something with request error
		notifError("Request failed.", error);
		// return Promise.reject(error);
		return error;
	}
);

// Response Interceptor
api.interceptors.response.use(
	(response) => {
		// Any status code within the range of 2xx will trigger this function
		// Do something with the response data
		notifSuccess();
		return response;
	},
	(error) => {
		// Any status codes outside the range of 2xx will trigger this function
		// // Do something with the response error
		// if (error.response && error.response.status === 401) {
		// 	// Handle 401: Unauthorized error
		// 	console.error("Unauthorized! Redirecting to login.");
		// 	// Redirect to login page or perform token refresh logic
		// } else {
		// 	console.error("Error response:", error);
		// }
		console.log("error", error);
		const resp = error.response
		let msg;
		if (resp.data?.detail) {
			msg = resp.data.detail;
		} else {
			msg = error.details;
		}
		notifError(`${resp.statusText} [${resp.status}]`, msg);

		// return Promise.reject(error);
		return error;
	}
);

interface NestInput {
	unit: string;
	bars: { [key: number]: number };
	parts: { [key: number]: number };
	can_cut_less_than_cut: boolean;
	cut_thickness: number;
	min_remnant_len: number;
}

export const nest = async (nestInput: NestInput) => {
	return await api.post("/1d/nest/pdf", nestInput);
};

export const nestDownloadExcel = async (nrt: string) => {
	// NOTE: without { responseType: 'blob' } this will not work!!!
	return await api.post("/1d/nest/excel", { nrt }, { responseType: "blob" });
};

export const nestDownloadCSV = async (nrt: string) => {
	// NOTE: without { responseType: 'blob' } this will not work!!!
	return await api.post("/1d/nest/csv", { nrt }, { responseType: "blob" });
};
