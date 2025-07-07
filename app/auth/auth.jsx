//file: app/auth/auth.hjsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Formik, Form, Field, useField } from 'formik';
import * as Yup from 'yup';
import Input from '../components/input';
import Button from "../components/button";
import styles from "./form.module.scss";
import { useUserStore } from '../../store/userStore';

const phoneRegExp = /^09[0-9]{9}$/;

const validationSchema = Yup.object({
  phone: Yup.string()
    .matches(phoneRegExp, 'شماره تلفن معتبر نیست')
    .required('شماره تلفن الزامی است'),
});

export default function AuthPage() {
  const router = useRouter();
  const { user, setUser } = useUserStore();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (values) => {
    try {
      const response = await fetch('https://randomuser.me/api/?results=1&nat=us');
      const data = await response.json();
      const userData = data.results[0];
      setUser(userData);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>ورود</h1>
        <Formik
          initialValues={{ phone: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className={styles.form}>
              <Field name="phone">
                {({ field }) => (
                  <Input
                    label="شماره تلفن"
                    name="phone"
                    type="tel"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.phone}
                    touched={touched.phone}
                  />
                )}
              </Field>
              <Button type="submit" disabled={isSubmitting}>
                ورود
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}