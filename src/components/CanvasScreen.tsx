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
  const [videoState, setVideoState] = useState<"init" | "canplay" | "playing">(
    "init"
  );
  const [blobUrl, setBlobUrl] = useState<string>("");
  const getCanvas = (): HTMLCanvasElement => {
    const canvas: any = canvasRef.current;

    return canvas;
  };
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
    const img = new Image();
    if (editItems[0].image) img.src = URL.createObjectURL(editItems[0].image);
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
    setVideoState("canplay");
  };
  const animationStart = async (isExport: boolean) => {
    if (!imageElement || !editItems || videoState === "playing") return;
    setVideoState("playing");
    const ctx: CanvasRenderingContext2D = getContext();
    const timer = (sec: number) =>
      new Promise<void>((resolve) => setTimeout(() => resolve(), sec * 1000));
    const recorder = (() => {
      //canvasの取得
      const canvas = getCanvas();
      //canvasからストリームを取得
      const stream = canvas.captureStream();
      //ストリームからMediaRecorderを生成
      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
      });
      return recorder;
    })();
    if (isExport) {
      //ダウンロード用のリンクを準備
      //録画終了時に動画ファイルのダウンロードリンクを生成する処理
      recorder.ondataavailable = function (e) {
        const videoBlob = new Blob([e.data], { type: e.data.type });
        const blob_Url = window.URL.createObjectURL(videoBlob);
        setBlobUrl(blob_Url);
      };
      //録画開始
      recorder.start();
    }
    for (let index = 0; index < imageElement.length; index++) {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(imageElement[index], 0, 0, width, height); //10, 10, 200, 50);
      await timer(editItems[index].sec);
    }

    ctx.fillRect(0, 0, width, height);
    ctx.save();
    setVideoState("canplay");
    if (isExport) {
      recorder.stop();
    }
  };
  const startExport = () => {
    animationStart(true);
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
        <Button
          isDisabled={(() => {
            switch (videoState) {
              case "init":
                return true;
              case "canplay":
                return false;
              case "playing":
                return true;
            }
          })()}
          onClick={() => animationStart(false)}
        >
          再生
        </Button>
        {/* <Button isDisabled={videoState !== "playing"}>
          停止
        </Button> */}
        <Button isDisabled={videoState !== "canplay"} onClick={startExport}>
          エクスポート
        </Button>
      </Flex>
      <Box>
        {blobUrl !== "" ? (
          <video
            src={blobUrl}
            controls
            style={{
              borderBlock: "solid",
              borderWidth: 1,
              borderColor: "#000",
            }}
          ></video>
        ) : (
          <></>
        )}
      </Box>
    </Center>
  );
};

export default CanvasScreen;
