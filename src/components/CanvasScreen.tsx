import { Box, Button, Center, Flex } from "@chakra-ui/react";
import { FC, useEffect, useRef, useState } from "react";
import { editItemType } from "./TimecodeEditor";

interface CanvasScreenProps {
  editItems: editItemType[] | undefined;
  editItemsCount: number;
}
const width = 350;
const height = 200;
const CanvasScreen: FC<CanvasScreenProps> = ({ editItems, editItemsCount }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement[]>();
  const getContext = (): CanvasRenderingContext2D => {
    const canvas: any = canvasRef.current;

    return canvas.getContext("2d");
  };
  const checkItem = () => {
    if (!editItems || editItems.length === 0 || editItemsCount === 0) return;
    const ctx: CanvasRenderingContext2D = getContext();
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
    // if (editItems[0].image) {
      const img = new Image();
      if(editItems[0].image) img.src = URL.createObjectURL(editItems[0].image);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height); //10, 10, 200, 50);
      };
      setImageElement((prev) =>
        prev
          ? editItems.map((item) => {
              const imgEle = new Image();
              if (item.image) imgEle.src = URL.createObjectURL(item.image);
              return imgEle;
            })
          : [img]
      );
    ctx.save();
  };
  const animationStart = async () => {
    if (!imageElement || !editItems) return
    const ctx: CanvasRenderingContext2D = getContext();
    const timer =(sec:number) => new Promise<void>((resolve)=>setTimeout(() => resolve(), sec * 1000))
    for (let index = 0; index < imageElement.length; index++) {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(imageElement[index], 0, 0, width, height); //10, 10, 200, 50);
      await timer(editItems[index].sec)
    }
    ctx.fillRect(0, 0, width, height);
    ctx.save();
  };
  useEffect(checkItem, [editItems]);
  return (
    <Center w="full" h="full" flexDirection="column">
      <Box>
        <canvas
          width={width}
          height={height}
          ref={canvasRef}
          style={{ borderBlock: "solid", borderWidth: 1, borderColor: "#000" }}
        ></canvas>
      </Box>
      <Flex>
        {/* <Button isDisabled={true} onClick={animationStart}> */}
        <Button isDisabled={false} onClick={animationStart}>
          再生
        </Button>
        <Button isDisabled={true}>停止</Button>
        <Button isDisabled={true}>エクスポート</Button>
      </Flex>
    </Center>
  );
};

export default CanvasScreen;
