import { Button, Flex, List } from "@chakra-ui/react";
import { useState } from "react";
import EditItem from "./EditItem";

export interface editItemType {
  no: number;
  sec: number;
  image: Blob | undefined;
}

const TimecodeEditor = () => {
  const [editItems, setEditItems] = useState<editItemType[]>();
  const [editItemsCount, setEditItemsCount] = useState<number>(0);

  const addEditorItem = () => {
    setEditItemsCount((prev) => prev + 1);
    setEditItems((prev) =>
      prev
        ? [...prev, { no: editItemsCount, sec: 1, image: undefined }]
        : [{ no: editItemsCount, sec: 1, image: undefined }]
    );
  };
  return (
    <Flex direction="column" w="2xl" h="full">
      <Button w="16" m="auto" onClick={addEditorItem}>
        追加
      </Button>
      <List overflowY="scroll">
        {editItems?.map((item, index) => (
          <EditItem key={index} item={item} setEditItems={setEditItems} />
        ))}
      </List>
    </Flex>
  );
};

export default TimecodeEditor;
