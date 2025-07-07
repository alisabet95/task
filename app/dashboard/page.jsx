'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore} from "../store/userStore"
import styles from './Dashboard.module.scss';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUserStore();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!user && !storedUser) {
      router.push('/auth');
    }
  }, [user, router]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome to the Dashboard</h1>
      {user && (
        <div className={styles.userInfo}>
          <p>Hello, {user.name.first} {user.name.last}!</p>
          <p>Email: {user.email}</p>
        </div>
      )}
    </div>
  );
}