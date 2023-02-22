import { Box, Button, Center, Flex, useDisclosure } from "@chakra-ui/react";
import { FC, useEffect, useRef, useState } from "react";
import ExportModal from "./ExportModal";
import { editItemType } from "./TimecodeEditor";

interface CanvasScreenProps {
  editItems: editItemType[] | undefined;
  editItemsCount: number;
}
const CanvasScreen: FC<CanvasScreenProps> = ({ editItems, editItemsCount }) => {
  const [canvasWidth, setCanvasWidth] = useState<number>(350);
  const [canvasHeight, setCanvasHeight] = useState<number>(200);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement[]>();
  const [videoState, setVideoState] = useState<"init" | "canplay" | "playing">(
    "init"
  );
  const [blobUrl, setBlobUrl] = useState<string>("");
  const {
    isOpen: isExportModalOpen,
    onOpen: onExportModalOpen,
    onClose: onExportModalClose,
  } = useDisclosure();
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
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    const img = new Image();
    if (editItems[0].image) img.src = URL.createObjectURL(editItems[0].image);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    img.onload = () => {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      const { naturalWidth: imageWidth, naturalHeight: imageHeight } = img;
      reflectImage2Canvas(
        img,
        imageWidth,
        imageHeight,
        canvasWidth,
        canvasHeight
      );
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
      onExportModalClose();
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
      const { naturalWidth: imageWidth, naturalHeight: imageHeight } =
        imageElement[index];

      reflectImage2Canvas(
        imageElement[index],
        imageWidth,
        imageHeight,
        canvasWidth,
        canvasHeight
      );

      await timer(editItems[index].sec);
    }

    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.save();
    setVideoState("canplay");
    if (isExport) {
      recorder.stop();
      onExportModalOpen();
    }
  };
  const startExport = () => {
    animationStart(true);
  };

  const getOrientation = (imageDomWidth: number, imageDomHeight: number) => {
    if (imageDomWidth > imageDomHeight) {
      return `landscape`;
    }
    return `portrait`;
  };

  const reflectImage2Canvas = (
    imageDom: HTMLImageElement,
    imageDomWidth: number,
    imageDomHeight: number,
    previewAreaDomWidth: number,
    previewAreaDomHeight: number
  ) => {
    const canvasDom = getCanvas();
    const canvasDomContext = getContext();
    const adjustedRatio = 0.85;
    const ratio =
      adjustedRatio *
      (getOrientation(imageDomWidth, imageDomHeight) === `landscape`
        ? previewAreaDomWidth / imageDomWidth
        : previewAreaDomHeight / imageDomHeight);

    canvasDom.width = previewAreaDomWidth;
    canvasDom.height = previewAreaDomHeight;

    const resizedImageDomWidth = imageDomWidth * ratio;
    const resizedImageDomHeight = imageDomHeight * ratio;

    const resizedImageDomCenterX = resizedImageDomWidth / 2;
    const resizedImageDomCenterY = resizedImageDomHeight / 2;
    const previewAreaDomCenterX = previewAreaDomWidth / 2;
    const previewAreaDomCenterY = previewAreaDomHeight / 2;

    const deltaParallelMoveX = previewAreaDomCenterX - resizedImageDomCenterX;
    const deltaParallelMoveY = previewAreaDomCenterY - resizedImageDomCenterY;

    canvasDomContext.fillStyle = "#000";
    canvasDomContext.fillRect(0, 0, canvasWidth, canvasHeight);
    canvasDomContext.drawImage(
      imageDom,
      deltaParallelMoveX,
      deltaParallelMoveY,
      imageDomWidth * ratio,
      imageDomHeight * ratio
    );
    canvasDomContext.save();

  };
  /**
   * canvasのリサイズ
   */
  const canvasResize = () => {
    let ScreenWidth = (document.documentElement.clientWidth / 7) * 4;
    // 計算して出した縦幅
    let ScreenHeight = (9 * ScreenWidth) / 16;
    // 実際の縦幅
    const windowHeight = document.documentElement.clientHeight;

    // 計算した縦幅が実際の縦幅より大きい時
    if (ScreenHeight > windowHeight) {
      ScreenHeight = windowHeight;
      // 計算した横幅を出す // 割り切れない時に誤差発生
      ScreenWidth = (16 * ScreenHeight) / 9;
      console.log("hoge");
    }

    const g = gcd(ScreenWidth, ScreenHeight);

    // ここで比率を出したい // 2つの値の最大公約数を求めてそれで割る
    console.log(`${ScreenWidth} : ${ScreenHeight}`);
    console.log(`${ScreenWidth / g} : ${ScreenHeight / g}`);
    setCanvasWidth(ScreenWidth);
    setCanvasHeight(ScreenHeight);
    checkItem();
  };

  /**
   * 最大公約数を求める
   * @param {number} w 横幅
   * @param {number} h 高さ
   * @returns {number}
   */
  const gcd = (w: number, h: number): number => {
    if (h === 0) {
      console.log("計算終了");
      console.log(w);
      return w;
    }
    console.log("計算中");
    return gcd(h, w % h);
  };
  useEffect(() => {
    canvasResize();
    window.addEventListener("resize", canvasResize);
  }, []);
  useEffect(checkItem, [editItems]);
  return (
    <Center w="full" h="full" flexDirection="column" ref={parentRef}>
      <Box>
        <canvas
          width={canvasWidth}
          height={canvasHeight}
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
      <ExportModal
        blobUrl={blobUrl}
        isOpen={isExportModalOpen}
        onClose={onExportModalClose}
        onOpen={() => {}}
      />
    </Center>
  );
};

export default CanvasScreen;
