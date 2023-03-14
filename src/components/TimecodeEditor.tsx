import { Button, Center, Flex, List, ListItem } from "@chakra-ui/react";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import EditItem from "./EditItem";
import { Reorder, useDragControls } from "framer-motion";
export interface editItemType {
  no: number;
  sec: number;
  image: Blob | undefined;
}

interface TimecodeEditorProps {
  editItems: editItemType[] | undefined;
  setEditItems: Dispatch<SetStateAction<editItemType[] | undefined>>;
  editItemsCount: number;
  setEditItemsCount: Dispatch<SetStateAction<number>>;
}
const TimecodeEditor: FC<TimecodeEditorProps> = ({
  editItems,
  editItemsCount,
  setEditItems,
  setEditItemsCount,
}) => {
  const addEditorItem = () => {
    setEditItemsCount((prev) => prev + 1);
    setEditItems((prev) =>
      prev
        ? [...prev, { no: editItemsCount, sec: 1, image: undefined }]
        : [{ no: editItemsCount, sec: 1, image: undefined }]
    );
  };
  const [reorderList, setReorderList] = useState(editItems?.map(i => i.no))
  useEffect(()=>{
    setReorderList(editItems?.map(i => i.no))
  },[editItems])
  return (
    <Flex direction="column" h="full" borderLeft="1px">
      <List
        as={Reorder.Group}
        values={editItems ?? []}
        onReorder={setEditItems}
        axis="y"
        layoutScroll
        overflow="scroll"
        h="full"
      >
        {editItems?.map((val, index) => (
          
            <EditItem
              // item={editItems?.find(i => i.no === val)}
              key={index}
              item={val}
              setEditItems={setEditItems}
              // controls={controls}
            />
          // </ListItem>
        ))}
      </List>
      <Center w="full" h="16" minH={16} borderTop="1px">
        <Button w="16" h="10" minH={10} m="auto" onClick={addEditorItem}>
          追加
        </Button>
      </Center>
    </Flex>
  );
};

export default TimecodeEditor;
