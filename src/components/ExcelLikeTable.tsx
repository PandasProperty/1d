import React, { useCallback, useMemo } from "react";
import { Table, NumberInput, Button, Group } from "@mantine/core";
import { IconX, IconClipboardPlus, IconExclamationMark } from "@tabler/icons-react";
import { hideNotification, notifications } from "@mantine/notifications";
import { existsVal, isNumber } from "@/utils";
import { ExcelLikeTableProps } from '@/types';
import { maxRows } from '@/constants';

const NOTIF_ID = "abc";

// const rowsPerLoad = 20;
const basicFieldProps = {
	min: 0,
	max: 20000,
	size: "xs",
	hideControls: true,
	allowedDecimalSeparators: [",", "."],
	decimalSeparator: ",",
};

const showNotifError = (title?: string, msg?: string) => {
	notifications.show({
		id: NOTIF_ID,
		loading: false,
		title: title,
		message: msg,
		color: "red",
		icon: <IconX />,
		autoClose: false,
		withCloseButton: true,
	});
};

const showNotifInfo = (title?: string, msg?: string) => {
	notifications.show({
		id: NOTIF_ID,
		loading: false,
		title: title,
		message: msg,
		color: "yellow",
		icon: <IconExclamationMark />,
		autoClose: false,
		withCloseButton: true,
	});
};

const ExcelLikeTable = ({ table_id, columnNames, data, updateData }: ExcelLikeTableProps) => {
	// Handler to update data state
	const handleInputChange = useCallback((row: number, column: number, value: number) => {
		if (value > basicFieldProps.max || value < basicFieldProps.min) {
			return;
		}
		updateData(row, column, value);
	}, [updateData]);

	const enforceFieldValidation: (rowIndex: number, columnIndex: number) => React.KeyboardEventHandler<HTMLInputElement> = useCallback((rowIndex, columnIndex) => (event) => {
			if (event.currentTarget.value !== "") {
				const value = Number.parseFloat(event.currentTarget.value);
				if (value > basicFieldProps.max || value < basicFieldProps.min) {
					event.currentTarget.value = data[rowIndex][columnIndex];
				}
			}
		}, [data]);

	const handleClickPaste = async () => {
		hideNotification(NOTIF_ID);
		try {
			const res = await navigator.clipboard.readText();
			const rows = res.split("\n");
			const data = [];

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

			let cell1 = null;
			let cell2 = null;
			const limit = maxRows - 1;
			for (let i = 0; i < rows.length; i++) {
				if (data.length > limit) {
					showNotifInfo(
						"We did not paste all your data",
						`You provided ${rows.length} rows but only ${maxRows} rows are allowed.`
					);
					break;
				}
				// Remove '\r' character from the end of each line using trim()
				const row = rows[i].trim().split(delimiter);
				cell1 = parseFloat(row[0]);
				// Ignore rows if: no first cell or non-number
				if (isNumber(cell1)) {
					cell2 = row[1];
					if (existsVal(cell2)) {
						cell2 = parseInt(row[1]);
						if (!isNumber(cell2)) {
							cell2 = undefined;
						}
					}
					data.push([cell1, cell2]);
				}
			}
			setGlobalData({ ...globalData, [table_id]: data });
		} catch (error) {
			showNotifError("Error while pasting data", "Please check your data and try again.");
		}
	};

	// Generate table rows
	const rows = useMemo(() => {
		return (
			<React.Fragment>
				{
					data.map((row: any, rowIndex: number) => (
						<tr key={rowIndex}>
							<td style={{ textAlign: "center", color: "#ced4da" }}>{rowIndex + 1}</td>
							{row.map((cell: any, columnIndex: number) => (
								<td key={columnIndex}>
									{columnIndex == 0 ? (
										<NumberInput
											{...basicFieldProps}
											value={cell}
											decimalScale={2}
											fixedDecimalScale={true}
											onChange={(val: any) => handleInputChange(rowIndex, columnIndex, val)}
											onKeyUp={enforceFieldValidation(rowIndex, columnIndex)}
										/>
									) : (
										<NumberInput
											{...basicFieldProps}
											allowDecimal={false}
											value={cell}
											onChange={(val: any) => handleInputChange(rowIndex, columnIndex, val)}
											onKeyUp={enforceFieldValidation(rowIndex, columnIndex)}
										/>
									)}
								</td>
							))}
						</tr>
					))
				}
			</React.Fragment>
			);
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [data]);

	return (
		<>
			<Group justify="left">
				<Button size="xs" variant="outline" leftSection={<IconClipboardPlus />} onClick={handleClickPaste}>
					Paste from Excel
				</Button>
			</Group>
			<Table striped highlightOnHover>
				<thead>
					<tr>
						<th style={{ textAlign: "center", color: "#ced4da" }}>#</th>
						{columnNames.map((el: string, ind: number) => {
							return <th key={ind}>{el}</th>;
						})}
					</tr>
				</thead>
				<tbody>{rows}</tbody>
			</Table>
		</>
	);
};

export default ExcelLikeTable;
