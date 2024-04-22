import * as XLSX from "xlsx";

const isEmptyField = (el: any) => {
	return el === "" || el === null || el === undefined;
};

export const removeEmptyRows = (arrays: any[][]) => {
	return arrays.filter((arr) => !arr.every((el) => isEmptyField(el)));
};

export const areAllRowsFilledRequired = (arrays: any[][], indices: number[] = []): boolean => {
	/**
	 * This function checks if all row have required fields filled.
	 */
	if (arrays === undefined) {
		return false;
	}

	// Create an array of only the indices to check
	const removedBlankRows = removeEmptyRows(arrays);
	const arrToCheck = removedBlankRows.map((arr) => indices.map((idx) => arr[idx]));
	if (arrToCheck.length === 0) {
		return false;
	}

	// If only one required field then check if none is empty
	if (indices.length == 1) {
		return arrToCheck.filter((arr) => isEmptyField(arr[0])).length == 0;
	}

	// If more required fields in a row then check for every row if it has faulty values
	let allRowsFilled = true;
	let allFilled = false;
	for (const arr of arrToCheck) {
		allFilled = arr.every((el) => !isEmptyField(el));
		if (!allFilled) {
			allRowsFilled = false;
			break;
		}
	}

	return allRowsFilled;
};

export const hasStringContent = (v: string | undefined | null): boolean => {
	return v !== undefined && v !== null && v.length > 0;
};

export const downloadFileWithName = (dataURL: any, fileName: string) => {
	/**
	 * NOTE:
	 *  use this to create a dataURL:
	 * 		dataURL = window.URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
	 * NOTE 2: 
	 * 	add the below code inside your component to cleanup unused blob:
			useEffect(() => {
				return () => window.URL.revokeObjectURL(dataURL); // clean-up memory on unmount
			}, []);
	 */
	const anchor = document.createElement("a");
	anchor.download = fileName;
	anchor.href = dataURL;
	anchor.dataset.downloadurl = ["text/plain", anchor.download, anchor.href].join(":");
	anchor.click();
};

export const formatISODateTimeToFileName = (isoDateTime: string) => {
	// Parse the ISO datetime string into a Date object
	const date = new Date(isoDateTime);

	// Extract and format individual components
	const year = date.getFullYear().toString().substr(-2);
	const day = ("0" + date.getDate()).slice(-2);
	const month = ("0" + (date.getMonth() + 1)).slice(-2);
	const hours = ("0" + date.getHours()).slice(-2);
	const minutes = ("0" + date.getMinutes()).slice(-2);
	const seconds = ("0" + date.getSeconds()).slice(-2);

	// Construct the filename in the format 'yyddmm_hhmmss'
	const fileName = `${year}${day}${month}_${hours}${minutes}${seconds}`;

	return fileName;
};

export const readExcelFile = async (file: File): Promise<any[][]> => {
	const data = await file.arrayBuffer();
	const workbook = XLSX.read(data, { type: "buffer" });
	const worksheetName = workbook.SheetNames[0];
	const worksheet = workbook.Sheets[worksheetName];
	return XLSX.utils.sheet_to_json(worksheet, { header: 1 });
};

export const readCSVFile = async (file: File): Promise<any[][]> => {
	// Assuming 'file' is a Blob or File object
	const text = await file.text();
	const rows = text.split("\n");
	const csvData = [];

	// Check the first row to detect the delimiter
	const firstRow = rows[0];

	// Try to detect the delimiter by splitting the first row
	let delimiter = ",";
	const potentialDelimiters = [",", ";", "\t"];
	for (const potentialDelimiter of potentialDelimiters) {
		if (firstRow.includes(potentialDelimiter)) {
			delimiter = potentialDelimiter;
			break;
		}
	}

	for (let i = 0; i < rows.length; i++) {
		// Remove '\r' character from the end of each line using trim()
		const row = rows[i].trim().split(delimiter);
		csvData.push(row);
	}

	return csvData;
};

export const existsVal = (v: any) => {
	return v !== null && v !== undefined;
};

export const isNumber = (v: any) => {
	return Number.isFinite(v);
};

const padTo2Digits = (num: number): string => {
	return num.toString().padStart(2, "0");
};

const generateErrMsgID = () => {
	/**
	 * This is intended to be printed out in every error notification so
	 * that I know when the error occured and can lookup for the
	 * proper logs on my server.
	 */
	const now = new Date();
	const day = padTo2Digits(now.getUTCDate());
	const hours = padTo2Digits(now.getUTCHours());
	const minutes = padTo2Digits(now.getUTCMinutes());
	const seconds = padTo2Digits(now.getUTCSeconds());

	return `${day}${hours}${minutes}${seconds}`;
};

export const formatErrMsg = (msg: any): string => {
	return `${msg} [${generateErrMsgID()}]`;
};
