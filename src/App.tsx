import { Box, Center, useMediaQuery } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import "./App.css";
import CanvasScreen from "./components/CanvasScreen";
import TimecodeEditor, { editItemType } from "./components/TimecodeEditor";
function App() {
  const [editItems, setEditItems] = useState<editItemType[]>();
  const [editItemsCount, setEditItemsCount] = useState<number>(0);
  const [isWide] = useMediaQuery("(min-width: 700px)");
  useEffect(() => {
    console.log(editItems);
  }, [editItems]);
  return (
    <Center
      className="App"
      w="100vw"
      h="100vh"
      border="1px"
      flexDirection={isWide ? "row" : "column"}
    >
      <Box
        flex={isWide ? 4 : 2}
        h={"full"}
        w={isWide ? "auto" : "full"}
        borderBottom={isWide ? "none" : "1px"}
      >
        <CanvasScreen editItems={editItems} editItemsCount={editItemsCount} />
      </Box>
      <Box
        flex={isWide ? 3 : 5}
        h={"full"}
        w={isWide ? "auto" : "full"}
        overflow="hidden"
      >
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
