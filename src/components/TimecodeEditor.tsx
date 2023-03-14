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
      <Reorder.Group
        values={editItems ?? []}
        onReorder={setEditItems}
        style={{ overflowY: "scroll", height: "100%", position:"relative" }}
        axis="y"
        layoutScroll
      >
        {editItems?.map((item, index) => (
          <EditItem item={item} key={index} setEditItems={setEditItems} />
        ))}
      </Reorder.Group>
      <Center w="full" h="16" minH={16} borderTop="1px">
        <Button w="16" h="10" minH={10} m="auto" onClick={addEditorItem}>
          追加
        </Button>
      </Center>
    </Flex>
  );
};

export default TimecodeEditor;
