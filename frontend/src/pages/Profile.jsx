import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import Card from "../components/common/Card";

export default function Profile() {
  const { user } = useContext(UserContext);

  return (
    <div style={{ padding: '2rem', maxWidth: 720, margin: '0 auto' }}>
      <h2>Profile</h2>
      <Card>
        <div style={{ fontWeight: 700 }}>{user.name || '—'}</div>
        <div style={{ color: '#6b7280' }}>Age: {user.age || '—'}</div>
        <div style={{ marginTop: 8 }}>
          <strong>Permissions</strong>
          <ul>
            <li>Notifications: {user.permissions?.notifications ? 'Allowed' : 'Not allowed'}</li>
            <li>Screen time: {user.permissions?.screenTime ? 'Allowed' : 'Not allowed'}</li>
            <li>Voice: {user.permissions?.voice ? 'Allowed' : 'Not allowed'}</li>
            <li>Wearable: {user.permissions?.wearable ? 'Allowed' : 'Not allowed'}</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
