import {
  Card,
  CardBody,
  Center,
  Image,
  Input,
  ListItem,
  Text,
} from "@chakra-ui/react";
import {
  ChangeEvent,
  Dispatch,
  FC,
  LegacyRef,
  SetStateAction,
  TouchEventHandler,
  useEffect,
  useRef,
} from "react";
import { editItemType } from "./TimecodeEditor";
import { Reorder, useDragControls } from "framer-motion";
import { DeleteIcon, DragHandleIcon } from "@chakra-ui/icons";

interface EditItemProps {
  item: editItemType | undefined;
  setEditItems: Dispatch<SetStateAction<editItemType[] | undefined>>;
}
const EditItem: FC<EditItemProps> = ({ item, setEditItems }) => {
  const controls = useDragControls();
  const editTime = (e: ChangeEvent<HTMLInputElement>) => {
    setEditItems((prev) =>
      prev?.map((edit) =>
        edit.no === item?.no
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
  const deleteItem = (no: number | undefined) => {
    if (no === undefined) return;
    setEditItems((prev) => prev?.filter((item) => item.no !== no));
  };
  const editImage = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.files);
    if (e.target.files === null || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setEditItems((prev) =>
      prev?.map((edit) =>
        edit.no === item?.no
          ? {
              no: edit.no,
              sec: edit.sec,
              image: file,
            }
          : edit
      )
    );
  };

  // モバイル対応
  const iRef = useRef<LegacyRef<SVGSVGElement> | undefined>(null);
  useEffect(() => {
    const touchHandler: TouchEventHandler<HTMLElement> = (e) =>
      e.preventDefault();

    const iTag = iRef.current;

    if (iTag) {
      //@ts-ignore
      iTag.addEventListener("touchstart", touchHandler, { passive: false });

      return () => {
        //@ts-ignore
        iTag.removeEventListener("touchstart", touchHandler, {
          passive: false,
        });
      };
    }
  }, [iRef]);
  return (
    <ListItem
      id={item?.no.toString()}
      as={Reorder.Item}
      value={item as unknown as string}
      dragListener={false}
      dragControls={controls}
      w="95%"
      h="40%"
      m="auto auto 10px auto"
      listStyleType="none"
      userSelect="none"
    >
      <Card h="full" border="1px">
        <CardBody>
          <Center h="full" position="relative">
            <DeleteIcon
              position="absolute"
              top="0%"
              right="0%"
              fontSize="lg"
              cursor="pointer"
              onClick={() => deleteItem(item?.no)}
            />
            <Center flex={1} h="full" position="relative" bg="#000">
              {item?.image ? (
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
                  value={item?.sec}
                  onChange={(e) => editTime(e)}
                />
                <Text>秒</Text>
              </Center>
            </Center>
            <DragHandleIcon
              //@ts-ignore
              ref={iRef}
              onPointerDown={(e) => controls.start(e)}
              cursor="grab"
              boxSize="9"
            />
          </Center>
        </CardBody>
      </Card>
    </ListItem>
  );
};

export default EditItem;
