import {
  Box,
} from "@chakra-ui/react";
import "./App.css";
import TimecodeEditor from "./components/TimecodeEditor";
function App() {
  return (
    <Box className="App" w="100vw" h="100vh">
      <TimecodeEditor/>
    </Box>
  );
}

export default App;
