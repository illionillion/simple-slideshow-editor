import { Box, Center } from "@chakra-ui/react";
import { useState } from "react";
import "./App.css";
import CanvasScreen from "./components/CanvasScreen";
import TimecodeEditor, { editItemType } from "./components/TimecodeEditor";
import { useEffect } from "react";
function App() {
  const [editItems, setEditItems] = useState<editItemType[]>();
  const [editItemsCount, setEditItemsCount] = useState<number>(0);
  useEffect(() => {
    console.log(JSON.stringify(editItems));
    
  }, [editItems]);
  return (
    <Center className="App" w="100vw" h="100vh" border="1px">
      <Box flex={4} h="full">
        <CanvasScreen editItems={editItems} editItemsCount={editItemsCount} />
      </Box>
      <Box flex={3} h="full">
        <TimecodeEditor
          editItems={editItems}
          setEditItems={setEditItems}
          editItemsCount={editItemsCount}
          setEditItemsCount={setEditItemsCount}
        />
      </Box>
    </Center>
  );
}

export default App;
