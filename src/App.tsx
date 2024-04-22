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

function App() {
	const theme = useMantineTheme();
	const [drawerOpened, setDrawerOpened] = useState(false);

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

				<NestingBoard />
			</Container>

		</>
	);
}

export default App;
