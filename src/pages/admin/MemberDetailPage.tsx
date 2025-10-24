import MemberDetailComponent from "../../component/admin/MemberDetailComponent";
import { useParams } from "react-router-dom";

const MemberDetailPage = () => {
  const { memberId } = useParams<{ memberId?: string }>();

  return (
    <MemberDetailComponent memberId={memberId ?? ""} />
  );
};

export default MemberDetailPage;
