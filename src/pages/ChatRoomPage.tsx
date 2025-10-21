import ChatRoomComponent from "../component/ChatRoomComponent";
import { useParams } from "react-router-dom";
const ChatPage = () => {
      const { roomId, receiver } = useParams<{ roomId: string; receiver: string }>();
    return (
        <>
        <div> 채팅방 페이지입니다.</div>
       <ChatRoomComponent roomId={Number(roomId??0)} receiver={receiver??""} />
        </>
    )
}
export default ChatPage;