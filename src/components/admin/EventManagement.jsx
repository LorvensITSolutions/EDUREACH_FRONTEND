// components/admin/EventsManagement.jsx
import EventForm from "../admin/EventForm";
import EventList from "../admin/EventList";

const EventManagement = () => {
  return (
    <div className="p-6 space-y-6">
      <EventForm />
      <EventList />
    </div>
  );
};

export default EventManagement;
