import { useParams, useLocation } from 'react-router-dom';
import ChatMatchingComponent from '../component/ChatMatchingComponent';

const RandomChatRoomPage = () => {
    const location = useLocation();

    return (
        <div>
            <ChatMatchingComponent/>
        </div>
    );
};

export default RandomChatRoomPage;