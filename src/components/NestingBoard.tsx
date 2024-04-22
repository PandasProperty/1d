import { useRef, useState } from "react";
import {
	Tabs,
	rem,
	Container,
	Button,
	Group,
	Affix,
	NumberInput,
	Stack,
	Checkbox,
	Select,
	Modal,
	Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import {
	IconSquareNumber1,
	IconSquareNumber2,
	IconSquareNumber3,
	IconArrowLeft,
	IconArrowRight,
	IconTableImport,
	IconUpload,
	IconX,
	IconFile,
} from "@tabler/icons-react";
import { Dropzone, MS_EXCEL_MIME_TYPE } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import ExcelLikeTable from "@/components/ExcelLikeTable.tsx";
import {
	areAllRowsFilledRequired,
	downloadFileWithName,
	removeEmptyRows,
	formatISODateTimeToFileName,
	readExcelFile,
	formatErrMsg,
	readCSVFile,
} from "@/utils";
import { nest, nestDownloadCSV, nestDownloadExcel } from "@/api/api";
import PDFContainer from "@/components/PDFContainer";
import { notifHide } from "@/hooks/notifications";
import { NestingBoardProps } from '@/types';
import { colNamesBars, colNamesParts, ID_TABLE_BARS, ID_TABLE_PARTS, maxRows } from '@/constants';

const CSV_MIME_TYPE = ["text/csv"];
const SPREADSHEET_MIME_TYPE = [...MS_EXCEL_MIME_TYPE, ...CSV_MIME_TYPE];

const iconStyle = { height: rem(18) };
const tabs = ["details", "bars", "parts"];
const initialActiveTab = tabs[tabs.indexOf("bars")];
const basicFieldProps = {
	min: 0,
	max: 20000,
	size: "sm",
	hideControls: true,
	allowedDecimalSeparators: [",", "."],
	decimalSeparator: ",",
	decimalScale: 2,
};
const units = ["mm", "cm", "m"];
const NOTIF_ID = "abc";

const showNotifError = (title?: string, msg?: string) => {
	notifications.show({
		id: NOTIF_ID,
		loading: false,
		title: title,
		message: formatErrMsg(msg),
		color: "red",
		icon: <IconX />,
		autoClose: false,
		withCloseButton: true,
	});
};

const findFirstEmptyArrayIndex = (arrayOfArrays: any, startIndex: number) => {
	for (let i = startIndex + 1; i < arrayOfArrays.length; i++) {
		if (arrayOfArrays[i].length === 0) {
			return i;
		}
	}
	return -1;
};

const NestingBoard = ({ globalData, setGlobalData }: NestingBoardProps) => {
	
	const [activeTab, setActiveTab] = useState<string>(initialActiveTab);
	const [nestResultToken, setNestResultToken] = useState<string>("");
	// const [dataURL, setDataURL] = useState<string>("");
	const [cancelCounter, setCancelCounter] = useState<number>(0);
	const [nestResult, setNestResult] = useState<Document | null>(null);
	const [nestResultDatetime, setNestResultDatetime] = useState<string>("");
	const [opened, { open, close }] = useDisclosure(false);
	const [opened2, { open: open2, close: close2 }] = useDisclosure(false);
	const [rejectedFiles, setRejectedFiles] = useState<any>([]);
	const pdfRef = useRef(null);
	const form = useForm({
		initialValues: {
			unit: units[0],
			cutThickness: 0,
			canCutLessThanCut: false,
			minRemnantLength: 0,
		},
	});
	const dataBars = globalData[ID_TABLE_BARS];
	const dataParts = globalData[ID_TABLE_PARTS];

	const navigateTabs = (nr_items: number) => {
		setActiveTab(tabs[tabs.indexOf(activeTab) + nr_items]);
	};

	const shouldDisableNext = () => {
		const disable_if_active_bars_and_empty =
			activeTab == tabs[tabs.indexOf("bars")] && !areAllRowsFilledRequired(dataBars, [0, 1]);
		const disable_if_active_parts_and_empty =
			activeTab == tabs[tabs.indexOf("parts")] && !areAllRowsFilledRequired(dataParts, [0, 1]);
		return disable_if_active_bars_and_empty || disable_if_active_parts_and_empty;
	};

	const handleCancel = () => {
		setCancelCounter((prev) => prev + 1);
		form.reset();
		setActiveTab(initialActiveTab);
	};

	const handleRun = async () => {
		const formVals = form.values;
		const bars = removeEmptyRows(dataBars);
		const parts = removeEmptyRows(dataParts);
		const res = await nest({
			unit: formVals.unit,
			bars: Object.fromEntries(bars),
			parts: Object.fromEntries(parts),
			can_cut_less_than_cut: formVals.canCutLessThanCut,
			cut_thickness: formVals.cutThickness,
			min_remnant_len: formVals.minRemnantLength,
		});

		if (res.status == 200) {
			setNestResult(res.data);
			setNestResultToken(res.headers.nrt);
			setNestResultDatetime(formatISODateTimeToFileName(res.headers.datetime));
			open(); // open modal
		}
	};

	const downloadPDF = () => {
		if (pdfRef.current) {
			// @ts-ignore
			pdfRef.current.downloadFileWithName(`cut_list_${nestResultDatetime}`);
		}
	};

	const downloadExcel = async () => {
		const res = await nestDownloadExcel(nestResultToken);
		if (res.status == 200) {
			const downloadUrl = window.URL.createObjectURL(
				new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
			);
			downloadFileWithName(downloadUrl, `cut_list_${nestResultDatetime}.xlsx`);
			window.URL.revokeObjectURL(downloadUrl); // Clean up the URL object
		}
	};

	const downloadCSV = async () => {
		const res = await nestDownloadCSV(nestResultToken);
		if (res.status == 200) {
			const downloadUrl = window.URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
			downloadFileWithName(downloadUrl, `cut_list_${nestResultDatetime}.csv`);
			window.URL.revokeObjectURL(downloadUrl); // Clean up the URL object
		}
	};

	const handleImport = async (files: File[]) => {
		notifHide(NOTIF_ID);
		const file = files[0];
		let res: any = null;
		if (file.type in CSV_MIME_TYPE) {
			res = await readCSVFile(file);
		} else {
			res = await readExcelFile(file);
		}
		let firstEmptyRowIndex = findFirstEmptyArrayIndex(res, 0);
		if (firstEmptyRowIndex == -1) {
			showNotifError(
				"Error - missing first empty row",
				"Please separate your details from bars-quantities with an empty row."
			);
			return;
		}
		if (firstEmptyRowIndex - 1 != 3) {
			showNotifError(
				"Error - Section Details",
				`Please check your data sheet. Expected 4 data rows, got ${firstEmptyRowIndex}.`
			);
			return;
		}
		let secondEmptyRowIndex = findFirstEmptyArrayIndex(res, firstEmptyRowIndex);
		if (secondEmptyRowIndex == -1) {
			showNotifError(
				"Error - missing second empty row",
				"Please separate your bars-quantities from parts-quantities with an empty row."
			);
			return;
		}
		const maxNrBars = maxRows;
		if (secondEmptyRowIndex - firstEmptyRowIndex > maxNrBars) {
			showNotifError("Error - too many bars rows", `${secondEmptyRowIndex - firstEmptyRowIndex}/${maxNrBars}`);
			return;
		}
		let thirdEmptyRowIndex = findFirstEmptyArrayIndex(res, secondEmptyRowIndex);
		if (thirdEmptyRowIndex != -1) {
			showNotifError(
				"Error - more than 2 empty rows",
				"Please check your data sheet and remove the redundant empty rows after parts-quantities."
			);
			return;
		}
		const maxNrParts = maxRows;
		if (res.length - secondEmptyRowIndex > maxNrParts) {
			showNotifError("Error - too many bars rows", `${res.length - secondEmptyRowIndex}/${maxNrParts}`);
			return;
		}
		close2();
		form.setFieldValue("unit", res[0][0]);
		form.setFieldValue("cutThickness", res[1][0]);
		form.setFieldValue("canCutLessThanCut", res[2][0] == 1);
		form.setFieldValue("minRemnantLength", res[3][0]);

		let newData: number[][] = [];
		for (let i = firstEmptyRowIndex + 1; i < secondEmptyRowIndex; i++) {
			newData.push([res[i][0], res[i][1]]);
		}
		updateGlobalData((prev: any) => ({ ...prev, [ID_TABLE_BARS]: newData }));

		newData = [];
		for (let i = secondEmptyRowIndex + 1; i < res.length; i++) {
			newData.push([res[i][0], res[i][1]]);
		}
		setGlobalData((prev: number[][]) => ({ ...prev, [ID_TABLE_PARTS]: newData }));
	};

	const updateGlobalData = (id: typeof ID_TABLE_BARS | typeof ID_TABLE_PARTS) => (
		row: number, column: number, value: any
	) => {
		const newData =  globalData[id];
		newData[row][column] = value;
		setGlobalData({ ...globalData, [id]: newData });
	}

	return (
		<>
			<Tabs value={activeTab} pb={"30%"}>
				<Tabs.List>
					<Tabs.Tab
						value={tabs[0]}
						disabled={activeTab != tabs[0]}
						leftSection={<IconSquareNumber1 style={iconStyle} />}
					>
						Details
					</Tabs.Tab>
					<Tabs.Tab
						value={tabs[1]}
						disabled={activeTab != tabs[1]}
						leftSection={<IconSquareNumber2 style={iconStyle} />}
					>
						Bars
					</Tabs.Tab>
					<Tabs.Tab
						value={tabs[2]}
						disabled={activeTab != tabs[2]}
						leftSection={<IconSquareNumber3 style={iconStyle} />}
					>
						Parts
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value="details" pt={16} >
					<Stack bg="var(--mantine-color-body)" justify="flex-start" maw={300} mx="auto">
						<Button onClick={open2} leftSection={<IconTableImport />}>
							Import data from Excel/CSV
						</Button>
						<Select {...form.getInputProps("unit")} label="Unit" data={units} size="sm" />
						<NumberInput {...basicFieldProps} {...form.getInputProps("cutThickness")} label="Cut thickness" />
						<Checkbox
							{...form.getInputProps("canCutLessThanCut")}
							checked={form.values.canCutLessThanCut}
							label="Can cut less than cut thickness?"
							description="For example: cut-thickness is 2mm, but on the last element only 1mm is left to cut (a laser could cut this, but a saw not)."
						/>
						<NumberInput
							{...basicFieldProps}
							{...form.getInputProps("minRemnantLength")}
							label="Minimum remnant length"
							description="Example: you don't want solutions that have remnant less than 100mm."
						/>
					</Stack>
				</Tabs.Panel>

				<Tabs.Panel value="bars" pt={16}>
					<ExcelLikeTable key={cancelCounter} table_id={ID_TABLE_BARS} columnNames={colNamesBars} data={globalData[ID_TABLE_BARS]} updateData={updateGlobalData(ID_TABLE_BARS)} />
				</Tabs.Panel>

				<Tabs.Panel value="parts" pt={16}>
					<ExcelLikeTable key={cancelCounter} table_id={ID_TABLE_PARTS} columnNames={colNamesParts} data={globalData[ID_TABLE_PARTS]} updateData={updateGlobalData(ID_TABLE_PARTS)} />
				</Tabs.Panel>
			</Tabs>

			<Affix position={{ bottom: 30, right: 0, left: 0 }}>
				<Container size="xs">
					<Group
						justify="center"
						p="sm"
						bg={"white"}
						maw={"100%"}
						m={"0 auto"}
						style={{ boxShadow: "0 8px 16px rgba(0, 0, 0, 0.3)" }}
					>
						<Button variant="outline" color="red" onClick={handleCancel}>
							Cancel
						</Button>
						<Button
							onClick={() => navigateTabs(-1)}
							disabled={activeTab == tabs[0]}
							leftSection={<IconArrowLeft size={16} />}
						>
							Back
						</Button>
						{activeTab != tabs[tabs.length - 1] ? (
							<Button
								rightSection={<IconArrowRight size={16} />}
								onClick={() => navigateTabs(1)}
								disabled={shouldDisableNext()}
								color={"blue"}
							>
								Next
							</Button>
						) : (
							<Button
								rightSection={<IconArrowRight size={16} />}
								onClick={handleRun}
								disabled={shouldDisableNext()}
								color={"green"}
							>
								Run
							</Button>
						)}
					</Group>
				</Container>
			</Affix>

			{/* Modal for PDF */}
			<Modal.Root className="modal-pdf" opened={opened} onClose={close} size={"90rem"} centered>
				<Modal.Overlay />
				<Modal.Content>
					<Modal.Header>
						<Modal.Title>
							<Group>
								<Text>Download as:</Text>
								<Button size="xs" variant="outline" onClick={() => downloadPDF()}>
									PDF
								</Button>
								<Button size="xs" variant="outline" onClick={() => downloadExcel()}>
									Excel
								</Button>
								<Button size="xs" variant="outline" onClick={() => downloadCSV()}>
									CSV
								</Button>
							</Group>
						</Modal.Title>
						<Modal.CloseButton />
					</Modal.Header>
					<Modal.Body>
						<PDFContainer ref={pdfRef} data={nestResult} fileName="cut_list" />
					</Modal.Body>
				</Modal.Content>
			</Modal.Root>

			{/* Modal for File import */}
			<Modal opened={opened2} onClose={close2} title="Import data from Excel/CSV" centered>
				<Dropzone
					onDragEnter={() => setRejectedFiles([])}
					onDrop={(files) => handleImport(files)}
					onReject={(files) => setRejectedFiles(files)}
					maxSize={1000 * 1024 ** 2}
					accept={SPREADSHEET_MIME_TYPE}
					multiple={false}
					// {...props}
				>
					<Group justify="center" gap="xl" mih={220} style={{ pointerEvents: "none" }}>
						<Dropzone.Accept>
							<IconUpload
								style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-blue-6)" }}
								stroke={1.5}
							/>
						</Dropzone.Accept>
						<Dropzone.Reject>
							<IconX style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-red-6)" }} stroke={1.5} />
						</Dropzone.Reject>
						<Dropzone.Idle>
							<IconFile
								style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-dimmed)" }}
								stroke={1.5}
							/>
						</Dropzone.Idle>

						<div>
							<Text size="xl" inline>
								Drag file here or click to select a file
							</Text>
							<Text size="sm" c="dimmed" ta={"center"} inline mt={7}>
								Max file size 1GB.
							</Text>
							{rejectedFiles.length == 1 && (
								<Text size="sm" c="red" ta={"center"} inline mt={7}>
									Improper file format
								</Text>
							)}
							{rejectedFiles.length >= 2 && (
								<Text size="sm" c="red" ta={"center"} inline mt={7}>
									Too many files selected. Select only 1.
								</Text>
							)}
						</div>
					</Group>
				</Dropzone>
			</Modal>
		</>
	);
};

export default NestingBoard;
