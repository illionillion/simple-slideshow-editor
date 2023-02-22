import { Center, Image, Input, ListItem, Text } from "@chakra-ui/react";
import { ChangeEvent, Dispatch, FC, SetStateAction } from "react";
import { editItemType } from "./TimecodeEditor";

interface EditItemProps {
  item: editItemType;
  setEditItems: Dispatch<SetStateAction<editItemType[] | undefined>>;
}
const EditItem: FC<EditItemProps> = ({ item, setEditItems }) => {
  const editTime = (e: ChangeEvent<HTMLInputElement>) => {
    setEditItems((prev) =>
      prev?.map((edit) =>
        edit.no === item.no
          ? {
              no: edit.no,
              sec: isNaN(parseInt(e.target.value))
                ? 1
                : parseInt(e.target.value),
              image: edit.image,
            }
          : edit
      )
    );
  };
  const editImage = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.files);
    if (e.target.files === null || e.target.files.length === 0) return;
    console.log(e.target.files[0]);
    const file = e.target.files[0]
    setEditItems((prev) =>
      prev?.map((edit) =>
        edit.no === item.no
          ? {
              no: edit.no,
              sec: edit.sec,
              image: file,
            }
          : edit
      )
    );
  };
  return (
    <ListItem h="2xs">
      <Center h="full">
        <Center flex={1} boxSize="fit-content">
          <Image w="fit-content" src={item.image && URL.createObjectURL(item.image)} />
        </Center>
        <Center flex={1} flexDirection="column">
          <Input
            type="file"
            accept="image/*"
            placeholder="画像ファイルを選択"
            onChange={(e) => editImage(e)}
          />
          <Center>
            <Input
              type="number"
              min={1}
              placeholder="n"
              value={item.sec}
              onChange={(e) => editTime(e)}
            />
            <Text>秒</Text>
          </Center>
        </Center>
      </Center>
    </ListItem>
  );
};

export default EditItem;
