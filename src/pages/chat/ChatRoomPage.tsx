import ChatRoomComponent from "../../component/chat/ChatRoomComponent";
import { useParams } from "react-router-dom";
const ChatPage = () => {
      const { roomId, receiver } = useParams<{ roomId: string; receiver: string }>();
    return (
        <>
       <ChatRoomComponent roomId={Number(roomId??0)} receiver={receiver??""} />
        </>
    )
}
export default ChatPage;