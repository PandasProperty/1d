import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { createTheme, MantineProvider } from "@mantine/core";
import { GlobalProvider } from "@/contexts/GlobalContext";
import { Notifications } from "@mantine/notifications";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dropzone/styles.css";
import "@/assets/custom.css";

const theme = createTheme({
	/** Your theme override here */
});

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<MantineProvider theme={theme}>
			<GlobalProvider>
				<App />
			</GlobalProvider>
			<Notifications position="top-right" zIndex={1000} />
		</MantineProvider>
	</React.StrictMode>
);
