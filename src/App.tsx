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
    console.log(isWide ? "row" : "column");
    if (isWide) {
      console.log("横並び");
    } else {
      console.log("縦並び");
    }
  }, [isWide]);
  return (
    <Center
      className="App"
      w="100vw"
      h="100vh"
      border="1px"
      flexDirection={isWide ? "row" : "column"}
    >
      <Box
        flex={4}
        h={isWide ? "full" : "30vh"}
        w={isWide ? "auto" : "full"}
        borderBottom="1px"
      >
        <CanvasScreen editItems={editItems} editItemsCount={editItemsCount} />
      </Box>
      <Box
        flex={3}
        h={isWide ? "full" : "600px"}
        w={isWide ? "auto" : "full"}
        paddingTop="10px"
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
