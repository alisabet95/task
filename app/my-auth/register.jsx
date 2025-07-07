
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Add useSearchParams
import { signIn } from "next-auth/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";


const registerYupSchema = Yup.object({
  username: Yup.string()
    .min(3, "یوزرنیم باید حداقل سه حرف باشد")
    .max(20, "یوزرنیم باید کمتر از 20 حرف باشد")
    .matches(/^[a-zA-Z0-9_]+$/, "فقط حرف انگلیسی، عدد و آندرلاین")
    .required("یوزرنیم اجباریست"),
  email: Yup.string()
    .email("باید ایمیل صحیح باشد")
    .required("ثبت ایمیل اجباریست"),
  password: Yup.string()
    .min(6, "پسوورد حداقل 6 حرف")
    .required("پسوورد اجباریست"),
  honey: Yup.string().optional(),
});

const loginYupSchema = Yup.object({
  email: Yup.string()
    .email("باید ایمیل صحیح باشد")
    .required("ثبت ایمیل اجباریست"),
  password: Yup.string()
    .min(6, "پسوورد حداقل 6 حرف")
    .required("پسوورد اجباریست"),
});

export default function AuthPageOther() {
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showMobileForm, setShowMobileForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams(); // Add useSearchParams
  const initialValues = { username: "", email: "", password: "", honey: "" };
  const formRef = useRef(null);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setShowMobileForm(false);
      }
    };

    if (showMobileForm && isMobile) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMobileForm, isMobile]);

  const handleSubmit = async (values, { resetForm, setSubmitting, setFieldError }) => {
    setIsLoading(true);
    setMessage("");
    try {
      if (isRegister) {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, honey: "" }),
        });

        const result = await res.json();
        if (res.ok) {
          setMessage("ثبت نام موفقیت‌آمیز بود، لطفاً ایمیل خود را برای تأیید چک کنید");
          resetForm();
          setIsRegister(false);
          if (isMobile) setShowMobileForm(false);
        } else {
          setFieldError("email", result.error || "ثبت نام ناموفق");
        }
      } else {
        const res = await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
        });

        if (res?.error) {
          switch (res.error) {
            case "لطفاً ایمیل و رمز عبور را وارد کنید":
              setFieldError("email", "لطفاً ایمیل و رمز عبور را وارد کنید");
              break;
            case "ایمیل وجود ندارد":
              setFieldError("email", "ایمیل وجود ندارد");
              break;
            case "رمز عبور نادرست است":
              setFieldError("password", "رمز عبور نادرست است");
              break;
            case "این حساب با گوگل ثبت شده است":
              setFieldError("email", "این حساب با گوگل ثبت شده است");
              break;
            case "لطفاً ابتدا ایمیل خود را تأیید کنید":
              setFieldError("email", "لطفاً ابتدا ایمیل خود را تأیید کنید");
              break;
            default:
              setFieldError("password", "خطای سرور رخ داده است. لطفاً بعداً تلاش کنید");
          }
        } else {
          router.push("/");
        }
      }
    } catch (error) {
      setFieldError(isRegister ? "email" : "password", "خطای غیرمنتظره رخ داد");
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      setMessage("ورود با گوگل ناموفق بود");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div
        ref={formRef}
        className={`bg-white p-8 rounded-lg shadow-md w-full max-w-md transition-all duration-300 ${
          isMobile && !showMobileForm ? "hidden" : "block"
        }`}
      >
        <header className="text-center">
          <h2 className="text-2xl font-bold mb-4">{isRegister ? "ثبت نام" : "ورود"}</h2>
          {isMobile && showMobileForm && (
            <button
              onClick={() => setShowMobileForm(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          )}
        </header>
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setIsRegister(true)}
            className={`px-4 py-2 rounded-l-md ${
              isRegister ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
            }`}
            disabled={isLoading}
          >
            ثبت نام
          </button>
          <button
            onClick={() => setIsRegister(false)}
            className={`px-4 py-2 rounded-r-md ${
              !isRegister ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
            }`}
            disabled={isLoading}
          >
            ورود
          </button>
        </div>
        <Formik
          initialValues={initialValues}
          validationSchema={isRegister ? registerYupSchema : loginYupSchema}
          onSubmit={handleSubmit}
          validateOnBlur
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              {isRegister && (
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    یوزرنیم
                  </label>
                  <Field
                    name="username"
                    type="text"
                    placeholder="یوزرنیم"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    disabled={isLoading}
                  />
                  <ErrorMessage
                    name="username"
                    component="p"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  ایمیل
                </label>
                <Field
                  name="email"
                  type="email"
                  placeholder="ایمیل"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  disabled={isLoading}
                />
                <ErrorMessage
                  name="email"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  پسوورد
                </label>
                <Field
                  name="password"
                  type="password"
                  placeholder="پسوورد"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  disabled={isLoading}
                />
                <ErrorMessage
                    name="password"
                    component="p"
                    className="text-red-500 text-sm mt-1"
                />
              </div>
              <div style={{ display: "none" }}>
                <label htmlFor="honey">Honeypot</label>
                <Field name="honey" type="text" />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
                disabled={isLoading || isSubmitting}
              >
                {isLoading ? "در حال پردازش..." : isRegister ? "ثبت نام" : "ورود"}
              </button>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 disabled:bg-gray-500 flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  "در حال پردازش..."
                ) : (
                  <>
               
                    ورود با گوگل
                  </>
                )}
              </button>
            </Form>
          )}
        </Formik>
        {message && (
          <p className="mt-4 text-sm text-center text-green-500">{message}</p>
        )}
        {searchParams.get("verified") === "true" && ( // Use searchParams
          <p className="mt-4 text-sm text-center text-green-500">
            ایمیل شما تأیید شد! لطفاً وارد شوید.
          </p>
        )}
      </div>
      {isMobile && !showMobileForm && (
        <button
          onClick={() => setShowMobileForm(true)}
          className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          ورود و ثبت‌نام
        </button>
      )}
    </div>
  );
}