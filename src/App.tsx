import { useState } from "react";
import {
	Burger,
	Container,
	useMantineTheme,
	Flex,
	Space,
} from "@mantine/core";
import logo from "./assets/logo.png"; // Importing the logo
import NestingBoard from "@/components/NestingBoard";
import { colNamesBars, colNamesParts, ID_TABLE_BARS, ID_TABLE_PARTS, initialNrRows } from './constants';
import { GlobalData } from './types';

function App() {
	const theme = useMantineTheme();
	const [drawerOpened, setDrawerOpened] = useState(false);

	const [globalData, setGlobalData] = useState<GlobalData>({
    [ID_TABLE_BARS]: Array.from({ length: initialNrRows }, () => new Array(colNamesBars.length).fill("")),
    [ID_TABLE_PARTS]: Array.from({ length: initialNrRows }, () => new Array(colNamesParts.length).fill("")),
  });

	return (
		<>
			<Container mih="100" p="md" size="xs">
				<Flex h="100%" gap="md" align="center">
					<div style={{ flexGrow: 1 }}>
						<img src={logo} alt="Logo" height="30px" />
					</div>

					<Burger
						opened={drawerOpened}
						onClick={() => setDrawerOpened((o) => !o)}
						size="sm"
						color={theme.colors.gray[6]}
					/>
				</Flex>

				<Space h={"md"} />

				<NestingBoard globalData={globalData} setGlobalData={setGlobalData} />
			</Container>

		</>
	);
}

export default App;
