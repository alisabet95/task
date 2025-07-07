//file: app/dashboard
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from "../../store/userStore";
import styles from './Dashboard.module.scss';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user, setUser } = useUserStore();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!user && !storedUser) {
      router.push('/auth');
    }
  }, [user, router]);

  const handleRefreshData = async () => {
    try {
      const response = await fetch('https://randomuser.me/api/?results=1&nat=us');
      const data = await response.json();
      const userData = data.results[0];
      setUser(userData);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('user-storage');
    router.push('/auth');
  };

  return (
    <div dir="rtl" className={styles.container}>
      <h1 className={styles.title}>داشبورد پروژه علی ثابت</h1>
      {user && (
        <div className={styles.userInfo}>
          <p>سلام  {user.name.first} {user.name.last} عزیز!</p>
          <p>ایمیلش: {user.email}</p>
        </div>
      )}
      <button
        className="bg-green-500 text-white px-4 py-2 rounded-full mt-4 mr-2"
        onClick={handleRefreshData}
      >
        به‌روزرسانی اطلاعات
      </button>
      <button
        className="bg-red-500 text-white px-4 py-2 rounded-full mt-4 mr-2"
        onClick={handleSignOut}
      >
        خروج
      </button>
      <Link className="bg-blue-400 text-black px-2 py-3 rounded-r-full mt-4" href="/">
        خونه
      </Link>
    </div>
  );
}