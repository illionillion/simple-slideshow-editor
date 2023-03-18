import {
  Button,
  Center,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { FC } from "react";

interface ExportModalProps {
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  blobUrl: string;
}
const ExportModal: FC<ExportModalProps> = ({
  title,
  isOpen,
  onClose,
  onOpen,
  blobUrl,
}) => {
  return (
    <Modal
      onClose={onClose}
      isOpen={isOpen}
      isCentered
      motionPreset="slideInBottom"
      scrollBehavior="inside"
      size="xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title ?? "結果"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Center>
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
          </Center>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>閉じる</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ExportModal;
