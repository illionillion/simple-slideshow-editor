import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Center,
  Flex,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderTrack,
  Spinner,
  useBoolean,
  useDisclosure,
} from "@chakra-ui/react";
import { FC, useEffect, useRef, useState } from "react";
import ExportModal from "./ExportModal";
import { editItemType } from "./TimecodeEditor";
import IconIcon from "@reacticons/ionicons";

interface CanvasScreenProps {
  editItems: editItemType[] | undefined;
  editItemsCount: number;
}
const CanvasScreen: FC<CanvasScreenProps> = ({ editItems, editItemsCount }) => {
  const [canvasWidth, setCanvasWidth] = useState<number>(350);
  const [canvasHeight, setCanvasHeight] = useState<number>(200);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement[]>();
  const [videoState, setVideoState] = useState<"init" | "canplay" | "playing">(
    "init"
  );
  const [timerId, setTimerId] = useState<NodeJS.Timer>();
  const [calcTime, setCalcTime] = useState<number>(0);
  const [displayTime, setDisplayTime] = useState<number>(0);
  const [timeCode, setTimeCode] = useState<{ start: number; end: number }[]>(
    []
  );
  const [totalTime, setTotalTime] = useState<number>(0);
  const [blobUrl, setBlobUrl] = useState<string>("");
  const {
    isOpen: isExportModalOpen,
    onOpen: onExportModalOpen,
    onClose: onExportModalClose,
  } = useDisclosure();
  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose,
  } = useDisclosure();
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState<string>("");
  const {
    isOpen: isSpinnerOpen,
    onOpen: onSpinnerOpen,
    onClose: onSpinnerClose,
  } = useDisclosure();
  const [isExport, setIsExpoort] = useBoolean(false);
  const getCanvas = (): HTMLCanvasElement => {
    const canvas: any = canvasRef.current;

    return canvas;
  };
  const getContext = (): CanvasRenderingContext2D => {
    const canvas: any = canvasRef.current;

    return canvas.getContext("2d");
  };

  const timer = (s: number) =>
    new Promise<void>((resolve) => {
      const start_time = performance.now();
      const timerid = setInterval(() => {
        const current_time = performance.now();
        const diff = current_time - start_time;
        const sec = Math.floor(diff / 1000);
        if (sec > s) {
          resolve();
          clearInterval(timerid);
        }
      }, 40);
    });

  const checkItem = () => {
    if (!editItems || editItems.length === 0 || editItemsCount === 0) return;
    setTotalTime(editItems.reduce((prev, cuurent) => prev + cuurent.sec, 0)); // 合計時間
    setDisplayTime(0);
    screenInit();
    // タイムコード
    setTimeCode(
      editItems.map((item, index1, arr) => {
        return index1 === 0
          ? { start: 0, end: item.sec }
          : {
              start: arr.reduce(
                (prev, current, index2) =>
                  index1 > index2 ? prev + current.sec : prev,
                0
              ),
              end: arr.reduce(
                (prev, current, index2) =>
                  index1 >= index2 ? prev + current.sec : prev,
                0
              ),
            };
      })
    );

    const img = new Image();
    setImageElement((prev) =>
      prev
        ? editItems.map((item) => {
            const imgEle = new Image();
            if (item.image) imgEle.src = URL.createObjectURL(item.image);
            return imgEle;
          })
        : [img]
    );
    setVideoState("canplay");
  };

  /**
   * 状態変更時
   */
  const onStateChange = () => {
    switch (videoState) {
      case "init":
        break;
      case "playing":
        onPlaying();
        break;
      case "canplay":
        // screenInit();
        break;
    }
  };
  const onPlaying = () => {
    try {
      const ctx: CanvasRenderingContext2D = getContext();
      const recorder = (() => {
        onExportModalClose();

        if (isExport) {
          //canvasの取得
          const canvas = getCanvas();
          //canvasからストリームを取得
          const stream = canvas.captureStream();
          //ストリームからMediaRecorderを生成
          const recorder = new MediaRecorder(stream, {
            mimeType: "video/webm;codecs=vp9",
          });
          return recorder;
        } else {
          return undefined;
        }
      })();
      if (isExport && recorder) {
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

      const start_time = performance.now() - calcTime; // 開始時間
      const timer = setInterval(() => {
        const current_time = performance.now(); // 終了時間
        const diff = current_time - start_time;
        setCalcTime(diff);
        // const sec = Math.floor((diff / 1000) * 100) / 100; // もし秒：m秒にするなら
        const sec = Math.floor(diff / 1000);

        // 描画する画像を選んで描画処理
        // 現在時刻がどの画像かを計算する
        const index = timeCode.findIndex(
          (item) => item.start <= sec && sec < item.end
        );
        console.log(sec);
        // console.log(timeCode);
        // console.log(index);

        if (imageElement && index > -1) {
          const { naturalWidth: imageWidth, naturalHeight: imageHeight } =
            imageElement[index];

          reflectImage2Canvas(
            imageElement[index],
            imageWidth,
            imageHeight,
            canvasWidth,
            canvasHeight
          );
        }

        if (displayTime < sec) setDisplayTime(sec); // 表示時間更新
        if (sec >= totalTime) {
          // 終了
          clearTimeout(timer);
          setTimerId(undefined);
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);
          ctx.save();
          setVideoState("canplay");
          if (isExport && recorder) {
            recorder.stop();
            onExportModalOpen();
            setIsExpoort.off();
            onSpinnerClose();
          }
        }
      }, 40);
      setTimerId(timer);
    } catch (error) {
      // console.error(error);
      console.log(error);
      setAlertTitle("アラート");
      setAlertMessage("お使いの端末・ブラウザはサポートされておりません。");
      onAlertOpen();
      onStop();
      setIsExpoort.off();
    }
  };
  const animationStart = () => {
    setVideoState("playing");
    setDisplayTime(0);
    setCalcTime(0);
  };
  const startExport = () => {
    setIsExpoort.on();
    onSpinnerOpen();
    animationStart();
  };
  const onStop = () => {
    setVideoState("canplay");
    setDisplayTime(0);
    setCalcTime(0);
    onSpinnerClose();
    clearTimeout(timerId);
    setTimerId(undefined);
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
  };

  /**
   * 画像追加・画面リサイズ時の画面初期化
   */
  const screenInit = () => {
    const ctx: CanvasRenderingContext2D = getContext();
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    const img = new Image();
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    if (editItems && editItems[0].image) {
      img.src = URL.createObjectURL(editItems[0].image);
      img.onload = () => {
        const { naturalWidth: imageWidth, naturalHeight: imageHeight } = img;
        reflectImage2Canvas(
          img,
          imageWidth,
          imageHeight,
          canvasWidth,
          canvasHeight
        );
      };
    } else {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
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

  // useEffects
  useEffect(onStateChange, [videoState]);
  useEffect(() => {
    if (videoState !== "playing") screenInit();
  }, [canvasWidth, canvasHeight]);
  useEffect(() => {
    canvasResize();
    window.addEventListener("resize", canvasResize);
  }, []);
  useEffect(checkItem, [editItems]);
  return (
    <Center w="full" h="full" flexDirection="column">
      <Box position="relative">
        {isSpinnerOpen && (
          <Center
            position="absolute"
            width="full"
            height="full"
            flexDir="column"
          >
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />
          </Center>
        )}
        <canvas
          width={canvasWidth}
          height={canvasHeight}
          ref={canvasRef}
          style={{ borderBlock: "solid", borderWidth: 1, borderColor: "#000" }}
        ></canvas>
      </Box>
      <Center width="full" height="10px">
        {(() => {
          const sec = Math.floor((calcTime / 1000) * 100) / 100;
          // console.log(sec);

          return (
            <Slider
              aria-label="time-label"
              defaultValue={0}
              min={0}
              max={totalTime}
              value={sec}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              {videoState === "playing" ? (
                <SliderMark
                  value={sec}
                  textAlign="center"
                  bg="blue.500"
                  color="white"
                  mt={1}
                  w={12}
                >
                  {displayTime} / {totalTime}
                </SliderMark>
              ) : (
                <></>
              )}
            </Slider>
          );
        })()}
      </Center>
      <Flex margin="24px auto 0px auto" gap="5px">
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
          onClick={animationStart}
          title="再生"
        >
          {/* 再生 */}
          <IconIcon name="play" />
        </Button>
        <Button
          onClick={onStop}
          isDisabled={videoState !== "playing"}
          title="停止"
        >
          {/* 停止 */}
          <IconIcon name="stop" />
        </Button>
        <Button
          isDisabled={videoState !== "canplay"}
          onClick={startExport}
          title="エクスポート"
        >
          {/* エクスポート */}
          <IconIcon name="cloud-upload" />
        </Button>
      </Flex>
      <ExportModal
        blobUrl={blobUrl}
        isOpen={isExportModalOpen}
        onClose={onExportModalClose}
        onOpen={() => {}}
      />
      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={closeRef}
        onClose={onAlertClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {alertTitle}
            </AlertDialogHeader>

            <AlertDialogBody>{alertMessage}</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={closeRef} onClick={onAlertClose}>
                閉じる
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Center>
  );
};

export default CanvasScreen;
