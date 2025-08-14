import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch('/api/auth/profile')
      .then(res => res.json())
      .then(data => setProfile(data));
  }, []);

  if (!profile) return <p>Loading...</p>;

  return (
    <main>
      <h1>{profile.username}'s Dashboard</h1>
      <p>Enrolled courses: {profile.courses?.length || 0}</p>
    </main>
  );
}
