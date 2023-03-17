import { Button, Center, Flex, List } from "@chakra-ui/react";
import { Dispatch, FC, SetStateAction } from "react";
import EditItem from "./EditItem";
import { Reorder } from "framer-motion";
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
        {editItems?.map((val) => (
          <EditItem key={val.no} item={val} setEditItems={setEditItems} />
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
