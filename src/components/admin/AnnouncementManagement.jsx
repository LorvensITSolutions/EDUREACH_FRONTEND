import AnnouncementForm from "../admin/AnnouncementForm";
import AnnouncementList from "../admin/AnnouncementList";

const AnnouncementManagement = () => {
  return (
    
    <div className="p-6 space-y-6">
      <AnnouncementForm />
      <AnnouncementList />
    </div>

  );
};

export default AnnouncementManagement;
