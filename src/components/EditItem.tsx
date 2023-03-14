import {
  Card,
  CardBody,
  Center,
  Image,
  Input,
  ListItem,
  Text,
} from "@chakra-ui/react";
import { ChangeEvent, Dispatch, FC, SetStateAction } from "react";
import { editItemType } from "./TimecodeEditor";
import { Reorder, useDragControls, useMotionValue } from "framer-motion";
import { DragHandleIcon } from "@chakra-ui/icons";

interface EditItemProps {
  item: editItemType;
  setEditItems: Dispatch<SetStateAction<editItemType[] | undefined>>;
}
const EditItem: FC<EditItemProps> = ({ item, setEditItems }) => {
  const controls = useDragControls();
  const y = useMotionValue(0);
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
    // console.log(e.target.files[0]);
    const file = e.target.files[0];
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
    <Reorder.Item
      value={item}
      id={item.no.toString()}
      dragListener={false}
      draggable={false}
      dragControls={controls}
      style={{
        width: "95%",
        height: "30%",
        margin: "auto auto 10px auto",
        listStyleType: "none",
        userSelect: "none",
        position: "relative",
        y,
      }}
    >
      <Card h="full" border="1px">
        <CardBody>
          <Center h="full">
            <Center flex={1} h="full" position="relative" bg="#000">
              {item.image ? (
                <Image
                  w="auto"
                  height="auto"
                  maxW="100%"
                  maxH="100%"
                  margin="auto"
                  position="absolute"
                  userSelect="none"
                  draggable={false}
                  top={0}
                  bottom={0}
                  left={0}
                  right={0}
                  src={item.image && URL.createObjectURL(item.image)}
                />
              ) : (
                <Center
                  w="auto"
                  height="auto"
                  maxW="100%"
                  maxH="100%"
                  margin="auto"
                  position="absolute"
                  top={0}
                  bottom={0}
                  left={0}
                  right={0}
                  bg="gray"
                >
                  No Image
                </Center>
              )}
            </Center>
            <Center flex={1} flexDirection="column">
              <Input
                type="file"
                accept="image/*"
                placeholder="画像ファイルを選択"
                onChange={(e) => editImage(e)}
                height="auto"
                padding={1}
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
            <DragHandleIcon onPointerDown={(e) => controls.start(e)} cursor="grab" boxSize="9" />
          </Center>
        </CardBody>
      </Card>
    </Reorder.Item>
  );
};

export default EditItem;
