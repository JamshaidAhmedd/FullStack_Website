import { useEffect, useState } from 'react';

export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch('/api/auth/profile')
      .then(res => res.json())
      .then(data => setProfile(data));
  }, []);

  if (!profile) return <p>Loading...</p>;

  return (
    <main>
      <h1>Profile</h1>
      <p>Username: {profile.username}</p>
      <p>Email: {profile.email}</p>
    </main>
  );
}
