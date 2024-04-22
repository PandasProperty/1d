import { Box, Button, Center } from "@mantine/core";
import { forwardRef, useEffect, useImperativeHandle } from "react";
import { downloadFileWithName } from "@/utils";


const PDFContainer = forwardRef(({ data, fileName = "my_file" }: any, ref) => {
	const dataURL: any = window.URL.createObjectURL(new Blob([data], { type: "application/pdf" }));

	useImperativeHandle(ref, () => ({
		downloadFileWithName(){downloadFileWithName(dataURL, fileName +  ".pdf")}
	}));

	useEffect(() => {
		return () => window.URL.revokeObjectURL(dataURL); // clean-up memory on unmount
	}, []);

	return (
		<Box maw={"100%"} h="100%">
			{/* <Group className="pdf-options" pb={"lg"}>
				<Button className="download" size="auto" variant="outline" onClick={downloadFileWithName}>
					Save PDF
				</Button>
			</Group> */}

			<object type="application/pdf" data={`${dataURL}`} width={"100%"} height={"100%"}>
				<Box hiddenFrom="md" h="100%">
					<Center py={"20%"}>
						<a href={dataURL} download>
							<Button size="md">Click here to open the document</Button>
						</a>
					</Center>
				</Box>
				<Box visibleFrom="md" h="100%">
					<iframe src={dataURL} width="100%" height={"100%"}></iframe>
				</Box>
			</object>
		</Box>
	);
});

export default PDFContainer;
